import { Router } from "express";
import { validate } from "../../middleware/validate.js";
import { trackingParamsSchema } from "./tracking.schemas.js";
import { getTracking } from "./tracking.controller.js";

export const trackingRouter = Router();

// PUBLIC route: no authenticate on purpose. Everything it returns must be safe for strangers
trackingRouter.get(
  "/:trackingNumber",
  validate(trackingParamsSchema, "params"),
  getTracking,
);
