-- Initialize individual microservice databases with dedicated ownership
CREATE DATABASE customer_db;
CREATE DATABASE product_db;
CREATE DATABASE policy_db;
CREATE DATABASE claims_db;
CREATE DATABASE payment_db;
CREATE DATABASE keycloak_db;

GRANT ALL PRIVILEGES ON DATABASE customer_db TO insurance_user;
GRANT ALL PRIVILEGES ON DATABASE product_db TO insurance_user;
GRANT ALL PRIVILEGES ON DATABASE policy_db TO insurance_user;
GRANT ALL PRIVILEGES ON DATABASE claims_db TO insurance_user;
GRANT ALL PRIVILEGES ON DATABASE payment_db TO insurance_user;
GRANT ALL PRIVILEGES ON DATABASE keycloak_db TO insurance_user;
