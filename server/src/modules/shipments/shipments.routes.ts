import { Router } from "express";
import { authenticate, requireRole } from "../../middleware/authenticate.js";
import { validate } from "../../middleware/validate.js";
import {
  createShipmentSchema,
  listShipmentsQuerySchema,
  shipmentIdParamsSchema,
} from "./shipments.schemas.js";
import {
  createShipment,
  listShipments,
  getShipment,
} from "./shipments.controller.js";

export const shipmentsRouter = Router();

shipmentsRouter.use(authenticate); // every shipment route needs a logged-in user

// requireRole runs BEFORE validation, so a wrong role gets 403 without the body being examined
shipmentsRouter.post(
  "/",
  requireRole("customer"),
  validate(createShipmentSchema),
  createShipment,
);
shipmentsRouter.get(
  "/",
  validate(listShipmentsQuerySchema, "query"),
  listShipments,
);
shipmentsRouter.get(
  "/:id",
  validate(shipmentIdParamsSchema, "params"),
  getShipment,
);
