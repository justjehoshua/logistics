export const SHIPMENT_STATUSES = [
  "pending",
  "assigned",
  "picked_up",
  "in_transit",
  "delivered",
  "cancelled",
] as const;

export type ShipmentStatus = (typeof SHIPMENT_STATUSES)[number];

// From each status, the statuses it may move to. delivered and cancelled are final
export const TRANSITIONS: Record<ShipmentStatus, readonly ShipmentStatus[]> = {
  pending: ["assigned", "cancelled"],
  assigned: ["picked_up", "cancelled"],
  picked_up: ["in_transit"],
  in_transit: ["delivered"],
  delivered: [],
  cancelled: [],
};

// Settable through PATCH /status. 'assigned' is only set by the assign endpoint
export const UPDATABLE_STATUSES = [
  "picked_up",
  "in_transit",
  "delivered",
  "cancelled",
] as const;

// Delivery staff may not cancel
export const STAFF_SETTABLE: readonly string[] = [
  "picked_up",
  "in_transit",
  "delivered",
];

// "Which statuses are allowed to move to target?" goes straight into the UPDATE's WHERE clause
export function statusesThatCanMoveTo(
  target: ShipmentStatus,
): ShipmentStatus[] {
  return SHIPMENT_STATUSES.filter((s) => TRANSITIONS[s].includes(target));
}
