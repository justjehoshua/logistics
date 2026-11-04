import { AppError } from "../../utils/AppError.js";
import {
  findShipmentByTrackingNumber,
  listPublicTimeline,
} from "./tracking.queries.js";

export async function trackShipment(trackingNumber: string) {
  const shipment = await findShipmentByTrackingNumber(trackingNumber);
  if (!shipment)
    throw new AppError(404, "NOT_FOUND", "Tracking number not found");

  const timeline = await listPublicTimeline(shipment.id);
  return {
    trackingNumber: shipment.trackingNumber,
    status: shipment.status,
    lastUpdate: timeline.length > 0 ? timeline[timeline.length - 1].at : null,
    timeline, // the id is used internally and never returned
  };
}
