import { pool } from "../../db/pool.js";

// PUBLIC data only. Never select addresses, names, phones, notes, weight or user ids here
export async function findShipmentByTrackingNumber(trackingNumber: string) {
  const { rows } = await pool.query(
    `SELECT id, tracking_number AS "trackingNumber", status FROM shipments WHERE tracking_number = $1`,
    [trackingNumber],
  );
  return rows[0] as
    | { id: string; trackingNumber: string; status: string }
    | undefined;
}

export async function listPublicTimeline(shipmentId: string) {
  const { rows } = await pool.query(
    `SELECT status, created_at AS "at" FROM shipment_events
     WHERE shipment_id = $1 ORDER BY created_at ASC, id ASC`,
    [shipmentId],
  );
  return rows as { status: string; at: Date }[];
}
