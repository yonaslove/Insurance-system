-- Idempotency support: a client-supplied key ensures a retried payment post is not recorded twice.
ALTER TABLE payments ADD COLUMN IF NOT EXISTS idempotency_key VARCHAR(100);

CREATE UNIQUE INDEX IF NOT EXISTS ux_payments_idempotency_key
    ON payments (idempotency_key)
    WHERE idempotency_key IS NOT NULL;
