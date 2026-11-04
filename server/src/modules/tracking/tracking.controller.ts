import type { Request, Response } from "express";
import { trackShipment } from "./tracking.service.js";
import type { TrackingParams } from "./tracking.schemas.js";

export async function getTracking(_req: Request, res: Response) {
  const { trackingNumber } = res.locals.params as TrackingParams;
  const tracking = await trackShipment(trackingNumber);
  res.json({ success: true, data: { tracking } });
}
