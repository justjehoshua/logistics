import { pool } from "../../db/pool.js";
import type { CreateShipmentInput } from "./shipments.schemas.js";

export type Viewer = { id: string; role: string };

// weight_kg::float8 because pg returns NUMERIC as a string
const COLUMNS = `id, tracking_number AS "trackingNumber", customer_id AS "customerId",
  assigned_staff_id AS "assignedStaffId", pickup_address AS "pickupAddress",
  delivery_address AS "deliveryAddress", recipient_name AS "recipientName",
  recipient_phone AS "recipientPhone", package_description AS "packageDescription",
  weight_kg::float8 AS "weightKg", status, created_at AS "createdAt", updated_at AS "updatedAt"`;

// The ownership rule, written ONCE. $1 = viewer role, $2 = viewer id (both from the verified token)
const SCOPE = `($1::text = 'admin'
  OR ($1::text = 'customer' AND customer_id = $2::uuid)
  OR ($1::text = 'staff' AND assigned_staff_id = $2::uuid))`;

// COLUMNS and SCOPE are constants. Everything that comes from a request goes through $1, $2 ...

export async function insertShipmentWithEvent(
  customerId: string,
  s: CreateShipmentInput,
  trackingNumber: string,
) {
  const client = await pool.connect(); // one connection so BEGIN/COMMIT share a session
  try {
    await client.query("BEGIN");
    const { rows } = await client.query(
      `INSERT INTO shipments
         (tracking_number, customer_id, pickup_address, delivery_address,
          recipient_name, recipient_phone, package_description, weight_kg)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING ${COLUMNS}`,
      [
        trackingNumber,
        customerId,
        s.pickupAddress,
        s.deliveryAddress,
        s.recipientName,
        s.recipientPhone,
        s.packageDescription,
        s.weightKg,
      ],
    );
    const shipment = rows[0];
    // The first entry of the tracking history, in the same transaction
    await client.query(
      `INSERT INTO shipment_events (shipment_id, status, note, created_by)
       VALUES ($1, 'pending', 'Shipment booked', $2)`,
      [shipment.id, customerId],
    );
    await client.query("COMMIT");
    return shipment;
  } catch (err) {
    await client.query("ROLLBACK"); // undo both inserts if either failed
    throw err;
  } finally {
    client.release();
  }
}

export async function listShipmentsFor(
  viewer: Viewer,
  filter: { status?: string; limit: number; offset: number },
) {
  const where = `${SCOPE} AND ($3::text IS NULL OR status = $3::text)`;
  const base = [viewer.role, viewer.id, filter.status ?? null];
  const [list, count] = await Promise.all([
    pool.query(
      `SELECT ${COLUMNS} FROM shipments WHERE ${where}
       ORDER BY created_at DESC, id DESC LIMIT $4 OFFSET $5`,
      [...base, filter.limit, filter.offset],
    ),
    pool.query(
      `SELECT count(*)::int AS total FROM shipments WHERE ${where}`,
      base,
    ),
  ]);
  return { rows: list.rows, total: count.rows[0].total as number };
}

export async function findShipmentFor(viewer: Viewer, id: string) {
  const { rows } = await pool.query(
    `SELECT ${COLUMNS} FROM shipments WHERE id = $3::uuid AND ${SCOPE}`,
    [viewer.role, viewer.id, id],
  );
  return rows[0]; // undefined if it doesn't exist OR isn't yours: the caller can't tell which
}
