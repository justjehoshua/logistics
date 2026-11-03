import { AppError } from "../../utils/AppError.js";
import { generateTrackingNumber } from "../../utils/trackingNumber.js";
import {
  insertShipmentWithEvent,
  listShipmentsFor,
  findShipmentFor,
  type Viewer,
} from "./shipments.queries.js";
import type {
  CreateShipmentInput,
  ListShipmentsQuery,
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
