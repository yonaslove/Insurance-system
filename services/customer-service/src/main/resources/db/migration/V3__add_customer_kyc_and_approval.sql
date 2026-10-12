-- Migration V3: Add customer KYC profile fields and approval workflow state
ALTER TABLE customers 
    ADD COLUMN IF NOT EXISTS date_of_birth DATE,
    ADD COLUMN IF NOT EXISTS gender VARCHAR(20),
    ADD COLUMN IF NOT EXISTS id_type VARCHAR(50),
    ADD COLUMN IF NOT EXISTS id_number VARCHAR(100),
    ADD COLUMN IF NOT EXISTS occupation VARCHAR(100),
    ADD COLUMN IF NOT EXISTS annual_income NUMERIC(15,2),
    ADD COLUMN IF NOT EXISTS emergency_contact_name VARCHAR(150),
    ADD COLUMN IF NOT EXISTS emergency_contact_phone VARCHAR(50),
    ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

ALTER TABLE app_users 
    ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
