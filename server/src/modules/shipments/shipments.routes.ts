import { Router } from "express";
import { authenticate, requireRole } from "../../middleware/authenticate.js";
import { validate } from "../../middleware/validate.js";
import {
  createShipmentSchema,
  listShipmentsQuerySchema,
  shipmentIdParamsSchema,
  updateStatusSchema,
  assignShipmentSchema,
} from "./shipments.schemas.js";
import {
  createShipment,
  listShipments,
  getShipment,
  getShipmentEvents,
  updateShipmentStatus,
  cancelOwnShipment,
  assignShipmentToStaff,
} from "./shipments.controller.js";

export const shipmentsRouter = Router();

shipmentsRouter.use(authenticate); // every shipment route needs a logged-in user

const idParams = validate(shipmentIdParamsSchema, "params");

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
shipmentsRouter.get("/:id", idParams, getShipment);
shipmentsRouter.get("/:id/events", idParams, getShipmentEvents);
shipmentsRouter.patch(
  "/:id/status",
  requireRole("staff", "admin"),
  idParams,
  validate(updateStatusSchema),
  updateShipmentStatus,
);
shipmentsRouter.patch(
  "/:id/cancel",
  requireRole("customer"),
  idParams,
  cancelOwnShipment,
);
shipmentsRouter.patch(
  "/:id/assign",
  requireRole("admin"),
  idParams,
  validate(assignShipmentSchema),
  assignShipmentToStaff,
);
