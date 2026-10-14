-- Race-safe customer numbering: a database sequence guarantees unique customer numbers under concurrent registration.
CREATE SEQUENCE IF NOT EXISTS customer_number_seq START WITH 4;

SELECT setval(
    'customer_number_seq',
    GREATEST(3, COALESCE(MAX(substring(customer_number FROM '[0-9]+$')::bigint), 3))
)
FROM customers;
