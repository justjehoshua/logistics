import type { Request, Response } from "express";
import {
  bookShipment,
  listForViewer,
  getShipmentForViewer,
} from "./shipments.service.js";
import type {
  CreateShipmentInput,
  ListShipmentsQuery,
  ShipmentIdParams,
} from "./shipments.schemas.js";

export async function createShipment(req: Request, res: Response) {
  const shipment = await bookShipment(
    req.user!.id,
    req.body as CreateShipmentInput,
  ); // id from the token
  res.status(201).json({ success: true, data: { shipment } });
}

export async function listShipments(req: Request, res: Response) {
  const result = await listForViewer(
    req.user!,
    res.locals.query as ListShipmentsQuery,
  );
  res.json({ success: true, data: result });
}

export async function getShipment(req: Request, res: Response) {
  const { id } = res.locals.params as ShipmentIdParams;
  const shipment = await getShipmentForViewer(req.user!, id);
  res.json({ success: true, data: { shipment } });
}
