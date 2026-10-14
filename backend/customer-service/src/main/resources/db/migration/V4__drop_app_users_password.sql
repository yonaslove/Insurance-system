-- Migration V4: Remove the plain-text password column.
-- Credentials are owned exclusively by Keycloak; app_users stores profile, role and status only.
ALTER TABLE app_users DROP COLUMN IF EXISTS password;
