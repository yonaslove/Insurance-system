CREATE TABLE customers (
    id UUID PRIMARY KEY,
    customer_number VARCHAR(50) NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50) NOT NULL,
    address TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ
);

CREATE INDEX idx_customers_search ON customers (last_name, first_name, email);
CREATE INDEX idx_customers_number ON customers (customer_number);

-- Fictional seed demo records
INSERT INTO customers (id, customer_number, first_name, last_name, email, phone, address, status, created_at)
VALUES 
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'CUST-2026-001', 'Alexander', 'Wright', 'a.wright@example.com', '+1 (555) 234-5678', '742 Evergreen Terrace, Springfield, IL', 'ACTIVE', CURRENT_TIMESTAMP),
    ('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'CUST-2026-002', 'Elena', 'Rostova', 'elena.rostova@example.com', '+1 (555) 876-5432', '1204 Pine Valley Rd, Boulder, CO', 'ACTIVE', CURRENT_TIMESTAMP),
    ('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'CUST-2026-003', 'Marcus', 'Chen', 'm.chen@example.com', '+1 (555) 432-1098', '88 Market St, Suite 400, San Francisco, CA', 'ACTIVE', CURRENT_TIMESTAMP);
