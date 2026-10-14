-- Race-safe claim numbering: a database sequence guarantees unique numbers even under concurrent submission.
CREATE SEQUENCE IF NOT EXISTS claim_number_seq START WITH 403;

SELECT setval(
    'claim_number_seq',
    GREATEST(402, COALESCE(MAX(substring(claim_number FROM '[0-9]+$')::bigint), 402))
)
FROM claims;
