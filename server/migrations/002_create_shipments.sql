CREATE TABLE shipments (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_number     VARCHAR(20) NOT NULL UNIQUE,
  customer_id         UUID NOT NULL REFERENCES users(id),
  assigned_staff_id   UUID REFERENCES users(id),
  pickup_address      TEXT NOT NULL,
  delivery_address    TEXT NOT NULL,
  recipient_name      VARCHAR(100) NOT NULL,
  recipient_phone     VARCHAR(30) NOT NULL,
  package_description TEXT NOT NULL,
  weight_kg           NUMERIC(8,2) NOT NULL CHECK (weight_kg > 0),
  status              VARCHAR(20) NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending','assigned','picked_up','in_transit','delivered','cancelled')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_shipments_customer_id ON shipments(customer_id);
CREATE INDEX idx_shipments_assigned_staff_id ON shipments(assigned_staff_id);
CREATE INDEX idx_shipments_status ON shipments(status);