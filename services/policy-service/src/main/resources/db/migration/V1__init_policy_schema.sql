CREATE TABLE policies (
    id UUID PRIMARY KEY,
    policy_number VARCHAR(50) NOT NULL UNIQUE,
    customer_id UUID NOT NULL,
    product_id UUID NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    premium_amount NUMERIC(19,2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_policies_number ON policies (policy_number);
CREATE INDEX idx_policies_customer ON policies (customer_id);
CREATE INDEX idx_policies_product ON policies (product_id);
CREATE INDEX idx_policies_status ON policies (status);

-- Fictional seed demo records
INSERT INTO policies (id, policy_number, customer_id, product_id, start_date, end_date, premium_amount, currency, status, created_at)
VALUES 
    ('11111111-9c0b-4ef8-bb6d-6bb9bd380a01', 'POL-2026-8801', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', '2026-02-01', '2027-02-01', 1440.00, 'USD', 'ACTIVE', CURRENT_TIMESTAMP),
    ('22222222-9c0b-4ef8-bb6d-6bb9bd380a02', 'POL-2026-8802', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', '2026-03-01', '2027-03-01', 5400.00, 'USD', 'ACTIVE', CURRENT_TIMESTAMP);
