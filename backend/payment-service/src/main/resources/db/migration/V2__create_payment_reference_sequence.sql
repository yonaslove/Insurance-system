-- Race-safe payment reference numbering: a database sequence guarantees unique references under concurrent recording.
CREATE SEQUENCE IF NOT EXISTS payment_reference_seq START WITH 9903;

SELECT setval(
    'payment_reference_seq',
    GREATEST(9902, COALESCE(MAX(substring(payment_reference FROM '[0-9]+$')::bigint), 9902))
)
FROM payments;
