CREATE TABLE products (
    id UUID PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    base_premium NUMERIC(19,2) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_code ON products (code);
CREATE INDEX idx_products_category ON products (category);

-- Fictional seed demo records
INSERT INTO products (id, code, name, description, category, base_premium, active, created_at)
VALUES 
    ('d3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'PRD-HLTH-CMP', 'Comprehensive Health Plus', 'Extensive inpatient, outpatient, prescription drug, and dental coverage.', 'HEALTH', 450.00, true, CURRENT_TIMESTAMP),
    ('e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 'PRD-AUTO-PREM', 'Premier Auto Shield', 'Collision, comprehensive, roadside assistance, and zero-deductible glass coverage.', 'AUTO', 120.00, true, CURRENT_TIMESTAMP),
    ('f5eebc99-9c0b-4ef8-bb6d-6bb9bd380a66', 'PRD-HOME-PROT', 'Homeowner Property Guard', 'Structural and contents insurance with water backup and natural peril rider.', 'HOME', 210.00, true, CURRENT_TIMESTAMP);
