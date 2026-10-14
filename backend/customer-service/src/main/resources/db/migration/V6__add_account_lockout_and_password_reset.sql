-- Migration V6: Account Lockout and Password Reset Support

-- Add lockout columns to app_users
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS failed_login_attempts INT NOT NULL DEFAULT 0;
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ;

-- Create password_reset_tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    token VARCHAR(100) NOT NULL UNIQUE,
    expiry_date TIMESTAMPTZ NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reset_token_val ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_reset_token_user ON password_reset_tokens(user_id);
