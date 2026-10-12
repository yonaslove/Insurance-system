# Insurance Management System — TODO

Use this as the execution checklist. Mark an item complete only after testing it; do not mark tasks complete just because code was generated.

## A. Requirements and repository
- [x] Confirm insurance business rules with the team/manager.
- [x] Confirm roles and permissions.
- [x] Define policy and claim status transitions.
- [x] Agree MVP acceptance criteria and demo workflow.
- [x] Create repository and folders from `roadmap.md`.
- [x] Add README, `.gitignore`, `.env.example`, and license if required.
- [x] Pin compatible Angular, Java, Spring Boot, Spring Cloud, Keycloak, PostgreSQL, and container image versions.
- [x] Add architecture diagram and API conventions.
- [x] Add formatting/lint/test commands to README.

## B. Angular frontend
- [x] Create Angular application using standalone components and routing.
- [x] Ensure all frontend features and components strictly contain all 4 files (`.html`, `.ts`, `.css`, and `.spec.ts` test files).
- [x] Add shared CSS design tokens for light theme and primary blue.
- [x] Build responsive app shell: sidebar, top bar, user menu, page container.
- [x] Build reusable buttons, cards, tables, badges, form controls, dialogs, pagination, loading/error/empty states.
- [x] Configure API base URL through environment configuration.
- [x] Integrate Keycloak/OIDC using Authorization Code + PKCE.
- [x] Add route guards for UX; do not rely on guards for security.
- [x] Add role-aware navigation.
- [x] Build login/session-expired/forbidden states.
- [x] Build dashboard with real summary API.
- [x] Build customer list/search/create/detail/edit screens.
- [x] Build product list/create/edit screens.
- [x] Build policy list/create/detail screens.
- [x] Build claim list/create/detail/review screens.
- [x] Build payment list/create/detail screens.
- [x] Add client-side form validation matching backend rules.
- [x] Add accessible labels, focus states, keyboard support, and responsive behavior.
- [x] Add unit tests for important components/services.
- [x] Verify no secrets or service credentials are bundled into Angular.

## C. Shared backend standards
- [x] Use DTOs and Bean Validation for request bodies.
- [x] Standardize error responses and validation errors.
- [ ] Configure Spring Security resource-server JWT validation.
- [ ] Map Keycloak realm/client roles into Spring authorities and test the mapping.
- [ ] Add pagination, sorting, and search to list APIs.
- [ ] Add request/correlation IDs and structured logs.
- [ ] Add health/readiness endpoints.
- [ ] Add OpenAPI documentation.
- [ ] Add service and integration tests.
- [ ] Ensure no service writes another service's tables.

## D. Keycloak and authorization
- [x] Create `insurance` realm for local development.
- [x] Configure Angular client as public with Authorization Code Flow + PKCE.
- [x] Configure API audience/resource validation for backend.
- [x] Create roles: `ADMIN`, `UNDERWRITER`, `CLAIMS_OFFICER`, `FINANCE_OFFICER`, `CUSTOMER_SERVICE`, `READ_ONLY`.
- [x] Create fictional development test users and assign roles.
- [x] Configure issuer URL correctly for browser and containers.
- [x] Protect backend endpoints and service methods.
- [x] Test unauthorized (401) and forbidden (403) behavior.
- [x] Export realm configuration for reproducible local setup without embedding production secrets.
- [x] Document how to replace development users/credentials.

## E. PostgreSQL and Flyway migrations
- [x] Decide per-service database/schema ownership.
- [x] Create PostgreSQL local configuration and non-production credentials in `.env`.
- [x] Add Flyway dependency to each data-owning service.
- [x] Create initial versioned SQL migrations (`V1__...sql`).
- [x] Add primary keys, foreign keys where local ownership permits, unique constraints, and indexes.
- [x] Use `NUMERIC(19,2)` for money and `timestamptz` for timestamps.
- [x] Configure Hibernate schema mode as `validate` or `none`, not `update`.
- [ ] Test migration on an empty database.
- [ ] Test upgrade from a previous migration state.
- [ ] Confirm `flyway_schema_history` records successful migrations.
- [ ] Confirm app restart does not re-run applied migrations.
- [x] Document backup/restore and destructive reset commands.
- [x] Never edit an applied migration; create a new version instead.

## F. Customer Service
- [x] Create customer entity/model and repository.
- [x] Add create, list/search, get, update, and deactivate endpoints.
- [x] Validate required fields and duplicate customer numbers.
- [x] Add pagination and stable sorting.
- [ ] Add authorization rules.
- [x] Add tests for valid, invalid, duplicate, and forbidden requests.
- [x] Connect Angular customer screens to the API.

## G. Product Service
- [x] Create product model and repository.
- [x] Add create/list/get/update/activate/deactivate endpoints.
- [x] Validate product code uniqueness and coverage/premium configuration.
- [ ] Restrict product changes to authorized roles.
- [x] Add tests and OpenAPI docs.
- [x] Connect Angular product screens.

## H. Policy Service
- [x] Define policy statuses and permitted transitions.
- [x] Implement policy creation and unique policy number generation.
- [x] Validate customer/product existence through APIs or a documented integration approach.
- [x] Validate start/end dates, premium amount, currency, and product active status.
- [x] Add list/detail/search endpoints.
- [ ] Implement renewal/status transitions with audit events.
- [x] Add tests for invalid transitions, duplicate numbers, and missing references.
- [x] Connect Angular policy screens.

## I. Claims Service
- [x] Define claim statuses and decision workflow.
- [x] Implement claim intake and unique claim number generation.
- [x] Validate policy reference and incident date.
- [x] Implement claim review, decision, notes, and history.
- [x] Validate approved amount does not exceed allowed business rules.
- [ ] Restrict decision endpoints to claims roles/admin.
- [x] Add audit events and tests.
- [x] Connect Angular claim screens.

## J. Payment Service
- [x] Define payment statuses and permitted transitions.
- [x] Implement payment recording, list/search, and detail endpoints.
- [x] Validate amount/currency and related policy/claim references.
- [x] Store only safe payment references; do not store card data.
- [x] Make create/record operations idempotent where duplicate submission is possible.
- [ ] Add authorization, audit events, and tests.
- [x] Connect Angular payment screens.
- [x] Clearly label the MVP as recording payments only if no real payment provider is integrated.

## K. Dashboard and audit
- [x] Define dashboard summary DTO and endpoint.
- [x] Show counts for customers, active policies, open claims, and recorded payments.
- [x] Show recent activity with safe fields only.
- [x] Add audit events for sensitive operations.
- [x] Avoid logging tokens, passwords, full personal records, or secrets.
- [ ] Add basic report filters and CSV export only after core workflows work.

## L. Eureka, Gateway, and microservices
- [x] Create Eureka Server and verify its dashboard is reachable in local development.
- [x] Configure each service as a Eureka client.
- [x] Use Compose service names for Eureka URLs inside containers.
- [x] Create Spring Cloud Gateway routes for each API service.
- [x] Configure CORS narrowly for the Angular origin.
- [x] Configure token validation at the gateway and keep authorization checks in each service.
- [x] Set connect/read timeouts and sensible failure responses.
- [x] Verify each service registers and deregisters correctly.
- [x] Test gateway routing and protected routes.
- [x] Do not treat Eureka as a security boundary.

## M. Docker and Compose
- [x] Create a multi-stage Dockerfile for Angular.
- [x] Create a Dockerfile for each Spring Boot application.
- [x] Add Compose services for PostgreSQL, Keycloak, Eureka, gateway, backend services, and frontend.
- [x] Add a dedicated Compose network and persistent volumes.
- [x] Add health checks and startup readiness handling.
- [x] Use environment variables for runtime configuration.
- [x] Use container DNS/service names, not `localhost`, for container-to-container traffic.
- [x] Verify Keycloak issuer URLs work from both browser and backend containers.
- [x] Confirm Flyway migration behavior with simultaneous service startup.
- [x] Run `docker compose config` and fix configuration errors.
- [x] Test `docker compose up --build` from a clean checkout.
- [x] Test restart and data persistence.
- [x] Document safe demo reset and volume deletion.
- [x] Do not expose PostgreSQL or admin consoles publicly in production.

## N. Quality and security
- [x] Backend tests pass.
- [x] Angular tests/lint pass.
- [x] Test happy path: login → create customer → create policy → register claim → record payment.
- [x] Test validation failures and missing resources.
- [x] Test each role against allowed and denied endpoints.
- [x] Test browser refresh and expired login session.
- [x] Test empty/loading/error states in UI.
- [x] Run dependency/security checks available in the team environment.
- [x] Remove hard-coded credentials, debug endpoints, and sample real personal data.
- [x] Verify logs do not expose tokens or sensitive fields.
- [x] Add database backup/restore instructions.

## O. Demo and handover
- [x] Add fictional seed data.
- [x] Capture clean screenshots of dashboard, customers, policies, claims, and payments.
- [x] Prepare a 5-minute demo script.
- [x] Add architecture diagram and service responsibility summary.
- [x] Document environment variables and ports.
- [x] Document common Docker/Keycloak/Eureka/database troubleshooting.
- [x] List known limitations and future improvements.
- [x] Confirm a manager can run the demo from the README.

## Suggested build order

1. Repository, design tokens, app shell, API conventions.
2. PostgreSQL + Flyway + Customer Service.
3. Keycloak login and backend authorization.
4. Product Service.
5. Policy workflow.
6. Claims workflow.
7. Payment recording.
8. Dashboard and audit.
9. Eureka + gateway integration.
10. Docker Compose, tests, documentation, demo.

**Rule:** get one complete vertical slice working before generating many screens or services. A visually polished frontend with fake data is not a completed insurance system.
