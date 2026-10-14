-- Race-safe policy numbering: a database sequence guarantees unique numbers even under concurrent issuance.
CREATE SEQUENCE IF NOT EXISTS policy_number_seq START WITH 8803;

SELECT setval(
    'policy_number_seq',
    GREATEST(8802, COALESCE(MAX(substring(policy_number FROM '[0-9]+$')::bigint), 8802))
)
FROM policies;
