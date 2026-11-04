import { z } from "zod";
import {
  SHIPMENT_STATUSES,
  UPDATABLE_STATUSES,
} from "./shipments.constants.js";

// strictObject: customerId, status, trackingNumber etc. are REJECTED, not silently ignored
export const createShipmentSchema = z.strictObject({
  pickupAddress: z.string().trim().min(5).max(500),
  deliveryAddress: z.string().trim().min(5).max(500),
  recipientName: z.string().trim().min(2).max(100),
  recipientPhone: z.string().trim().min(5).max(30),
  packageDescription: z.string().trim().min(3).max(1000),
  weightKg: z.number().positive().max(10000), // a JSON number, not a string
});

export const updateStatusSchema = z.strictObject({
  status: z.enum(UPDATABLE_STATUSES),
  note: z.string().trim().min(1).max(500).optional(),
});

export const assignShipmentSchema = z.strictObject({
  staffId: z.uuid(),
});

// Query strings arrive as text, so numbers need coercion. Defaults apply when a value is missing
export const listShipmentsQuerySchema = z.object({
  status: z.enum(SHIPMENT_STATUSES).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// A malformed id would make PostgreSQL throw a type error (a 500), so reject it here instead
export const shipmentIdParamsSchema = z.object({
  id: z.uuid(),
});

export type CreateShipmentInput = z.infer<typeof createShipmentSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
export type AssignShipmentInput = z.infer<typeof assignShipmentSchema>;
export type ListShipmentsQuery = z.infer<typeof listShipmentsQuerySchema>;
export type ShipmentIdParams = z.infer<typeof shipmentIdParamsSchema>;
