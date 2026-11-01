CREATE TABLE shipment_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID NOT NULL REFERENCES shipments(id),
  status      VARCHAR(20) NOT NULL
              CHECK (status IN ('pending','assigned','picked_up','in_transit','delivered','cancelled')),
  note        TEXT,
  created_by  UUID NOT NULL REFERENCES users(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_shipment_events_shipment_created
  ON shipment_events(shipment_id, created_at);