-- Migration V2: Add users, authentication credentials, and actor roles
-- Only the System Administrator is provisioned by default.
-- All other staff actors are added by the Administrator, and customers can self-register.

CREATE TABLE app_users (
    id UUID PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    role VARCHAR(50) NOT NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ
);

CREATE INDEX idx_users_username ON app_users (username);
CREATE INDEX idx_users_email ON app_users (email);
CREATE INDEX idx_users_role ON app_users (role);
CREATE INDEX idx_users_customer ON app_users (customer_id);

-- Only provision the initial System Administrator
INSERT INTO app_users (id, username, password, email, full_name, role, customer_id, status, created_at)
VALUES
    (
        '10000000-0000-0000-0000-000000000001',
        'admin',
        'Admin123!',
        'admin@insurance-corp.com',
        'System Administrator',
        'ADMIN',
        NULL,
        'ACTIVE',
        CURRENT_TIMESTAMP
    );
