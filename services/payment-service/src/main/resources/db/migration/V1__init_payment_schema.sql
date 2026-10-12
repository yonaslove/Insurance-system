CREATE TABLE payments (
    id UUID PRIMARY KEY,
    payment_reference VARCHAR(50) NOT NULL UNIQUE,
    policy_id UUID NOT NULL,
    claim_id UUID,
    amount NUMERIC(19,2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    payment_method_reference VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'COMPLETED',
    paid_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payments_reference ON payments (payment_reference);
CREATE INDEX idx_payments_policy ON payments (policy_id);
CREATE INDEX idx_payments_status ON payments (status);

-- Fictional seed demo records
INSERT INTO payments (id, payment_reference, policy_id, claim_id, amount, currency, payment_method_reference, status, paid_at, created_at)
VALUES 
    ('55555555-9c0b-4ef8-bb6d-6bb9bd380a05', 'PAY-REF-9901', '11111111-9c0b-4ef8-bb6d-6bb9bd380a01', NULL, 1440.00, 'USD', 'ACH-DIRECT-DEBIT-***4891', 'COMPLETED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('66666666-9c0b-4ef8-bb6d-6bb9bd380a06', 'PAY-REF-9902', '22222222-9c0b-4ef8-bb6d-6bb9bd380a02', NULL, 5400.00, 'USD', 'WIRE-TRANSFER-***1124', 'COMPLETED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
