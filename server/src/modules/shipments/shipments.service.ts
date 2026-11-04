import { AppError } from "../../utils/AppError.js";
import { generateTrackingNumber } from "../../utils/trackingNumber.js";
import { findStaffById } from "../users/users.queries.js";
import {
  insertShipmentWithEvent,
  listShipmentsFor,
  findShipmentFor,
  changeShipmentStatus,
  assignStaffToShipment,
  listEvents,
  type Viewer,
} from "./shipments.queries.js";
import {
  STAFF_SETTABLE,
  statusesThatCanMoveTo,
  type ShipmentStatus,
} from "./shipments.constants.js";
import type {
  CreateShipmentInput,
  ListShipmentsQuery,
  UpdateStatusInput,
} from "./shipments.schemas.js";

export async function bookShipment(
  customerId: string,
  input: CreateShipmentInput,
) {
  // The tracking number is UNIQUE in the database. In the (very unlikely) event of a collision,
  // PostgreSQL error 23505 tells us, and we simply try a fresh number
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await insertShipmentWithEvent(
        customerId,
        input,
        generateTrackingNumber(),
      );
    } catch (err) {
      if ((err as { code?: string }).code !== "23505") throw err;
    }
  }
  throw new AppError(
    500,
    "TRACKING_NUMBER_FAILED",
    "Could not create the shipment, please try again",
  );
}

export async function listForViewer(viewer: Viewer, query: ListShipmentsQuery) {
  const { rows, total } = await listShipmentsFor(viewer, {
    status: query.status,
    limit: query.limit,
    offset: (query.page - 1) * query.limit,
  });
  return {
    shipments: rows,
    pagination: { page: query.page, limit: query.limit, total },
  };
}

export async function getShipmentForViewer(viewer: Viewer, id: string) {
  const shipment = await findShipmentFor(viewer, id);
  if (!shipment) throw new AppError(404, "NOT_FOUND", "Shipment not found"); // 404 whether missing or not yours
  return shipment;
}

export async function getEventsForViewer(viewer: Viewer, id: string) {
  await getShipmentForViewer(viewer, id); // 404 unless this viewer may see the shipment
  return listEvents(id);
}

async function applyTransition(
  viewer: Viewer,
  id: string,
  target: ShipmentStatus,
  note: string | null,
) {
  const updated = await changeShipmentStatus(
    viewer,
    id,
    target,
    statusesThatCanMoveTo(target),
    note,
  );
  if (updated) return updated;

  // Nothing changed. Either the viewer can't see it (404), or the move isn't legal from here (409)
  const existing = await findShipmentFor(viewer, id);
  if (!existing) throw new AppError(404, "NOT_FOUND", "Shipment not found");
  throw new AppError(
    409,
    "INVALID_TRANSITION",
    `A shipment that is ${existing.status} cannot be changed to ${target}`,
  );
}

export async function updateStatus(
  viewer: Viewer,
  id: string,
  input: UpdateStatusInput,
) {
  if (viewer.role === "staff" && !STAFF_SETTABLE.includes(input.status)) {
    throw new AppError(
      403,
      "FORBIDDEN",
      "You do not have permission to set this status",
    );
  }
  return applyTransition(viewer, id, input.status, input.note ?? null);
}

export async function cancelShipment(viewer: Viewer, id: string) {
  return applyTransition(viewer, id, "cancelled", "Cancelled by customer");
}

export async function assignShipment(
  admin: Viewer,
  id: string,
  staffId: string,
) {
  const updated = await assignStaffToShipment(admin.id, id, staffId);
  if (updated) return updated;

  // Nothing changed: work out WHY, so the admin knows what to fix
  const existing = await findShipmentFor(admin, id);
  if (!existing) throw new AppError(404, "NOT_FOUND", "Shipment not found");
  const staff = await findStaffById(staffId);
  if (!staff)
    throw new AppError(
      400,
      "INVALID_STAFF",
      "That user is not a delivery staff member",
    );
  throw new AppError(
    409,
    "INVALID_TRANSITION",
    `A shipment that is ${existing.status} cannot be assigned`,
  );
}
