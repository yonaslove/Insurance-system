CREATE TABLE claims (
    id UUID PRIMARY KEY,
    claim_number VARCHAR(50) NOT NULL UNIQUE,
    policy_id UUID NOT NULL,
    incident_date DATE NOT NULL,
    description TEXT NOT NULL,
    claimed_amount NUMERIC(19,2) NOT NULL,
    approved_amount NUMERIC(19,2),
    status VARCHAR(20) NOT NULL DEFAULT 'SUBMITTED',
    reviewer_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ
);

CREATE INDEX idx_claims_number ON claims (claim_number);
CREATE INDEX idx_claims_policy ON claims (policy_id);
CREATE INDEX idx_claims_status ON claims (status);

-- Fictional seed demo records
INSERT INTO claims (id, claim_number, policy_id, incident_date, description, claimed_amount, approved_amount, status, reviewer_notes, created_at)
VALUES 
    ('33333333-9c0b-4ef8-bb6d-6bb9bd380a03', 'CLM-2026-401', '11111111-9c0b-4ef8-bb6d-6bb9bd380a01', '2026-03-14', 'Rear bumper collision in parking structure. Low speed impact.', 1850.00, 1600.00, 'APPROVED', 'Police report and photo evidence verified. Approved deductible applied.', CURRENT_TIMESTAMP),
    ('44444444-9c0b-4ef8-bb6d-6bb9bd380a04', 'CLM-2026-402', '22222222-9c0b-4ef8-bb6d-6bb9bd380a02', '2026-04-02', 'Emergency room visit for acute appendicitis evaluation and treatment.', 4200.00, NULL, 'UNDER_REVIEW', NULL, CURRENT_TIMESTAMP);
