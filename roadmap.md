# Insurance Management System — Roadmap

## 1. Product goal

Build a professional, demo-ready insurance management system for an insurance company. The system should let authorized staff manage customers, insurance products, policies, claims, payments, and basic reporting through a clean Angular web application backed by Spring Boot services.

**Primary success criteria**
- A user can sign in and see only the functions permitted by their role.
- Staff can create and find customers, configure insurance products, issue policies, register claims, record payments, and view operational summaries.
- Business rules and validation live on the backend, not only in Angular.
- Data survives restarts and schema changes are versioned through database migrations.
- The system runs reproducibly with Docker Compose and has clear setup instructions.
- The UI uses a light background, one consistent primary color, accessible contrast, and shared design tokens.

## 2. Scope and delivery strategy

Build in vertical slices. First deliver a working modular MVP, then split into independently deployable services where there is a real boundary. Microservices add operational complexity; do not create empty services merely to make the architecture look impressive.

### MVP features
1. Authentication and role-based access.
2. Dashboard with real counts and recent activity.
3. Customer CRUD and search.
4. Insurance product CRUD (admin/underwriting roles).
5. Policy creation, viewing, renewal/status transitions.
6. Claim registration, review/status transitions, and notes.
7. Payment recording and payment history.
8. Audit events for important actions.
9. Basic reports and CSV export if time allows.

### Out of scope for the first release
- Real payment gateway integration.
- Automated underwriting or AI risk scoring.
- Mobile apps.
- Multi-country tax/accounting rules.
- Production high availability, Kubernetes, service mesh, or event streaming.
- Storing raw card data, passwords, or unnecessary sensitive documents.

## 3. Recommended technology baseline

Use compatible, currently supported versions and pin exact versions in the repository rather than using `latest`.

- **Frontend:** Angular, TypeScript, Angular Router, Reactive Forms, HttpClient. Every frontend component and feature must strictly contain all 4 files: `.html`, `.ts`, `.css`, and `.spec.ts` (test file).
- **Backend:** Java LTS supported by the selected Spring Boot release, Spring Boot, Spring Security, Spring Data JPA, Bean Validation.
- **Identity:** Keycloak using OpenID Connect (OIDC); Angular uses Authorization Code Flow with PKCE. APIs validate bearer access tokens.
- **Service discovery:** Eureka Server and Eureka Client for Spring services. Eureka is for service discovery; it is not an authentication tool or an API gateway.
- **Database:** PostgreSQL.
- **Schema migrations:** Flyway (recommended) or Liquibase; choose one only. This plan uses Flyway.
- **Containers:** Dockerfiles and Docker Compose for local development/demo.
- **Testing:** JUnit 5, Spring Boot Test, Testcontainers where practical, Angular unit tests, and API smoke tests.
- **API docs:** Springdoc OpenAPI.
- **Observability:** structured logs, health endpoints, and correlation/request IDs.

Version rule: select compatible Angular, Java, Spring Boot, Keycloak, PostgreSQL, and Docker image versions at project start. Pin them in configuration and document upgrades. Do not mix arbitrary major versions.

## 4. Architecture

### Suggested repository layout

```text
insurance-management/
├── frontend/
│   └── insurance-web/                 # Angular
├── backend/
│   ├── discovery-server/               # Eureka Server
│   ├── api-gateway/                    # Spring Cloud Gateway; routes + token checks
│   ├── customer-service/
│   ├── product-service/
│   ├── policy-service/
│   ├── claims-service/
│   └── payment-service/
├── infra/
│   ├── keycloak/
│   └── postgres/
├── docker-compose.yml
├── .env.example
├── docs/
│   ├── architecture.md
│   ├── api-contracts.md
│   └── runbook.md
└── README.md
```

**Scope control:** If the schedule or team is small, begin with one Spring Boot application divided into clear modules, then extract services only after the core workflow works. If the assignment explicitly requires microservices, implement the listed services but keep each service small and independently testable.

### Service responsibilities

| Component | Responsibility | Data ownership |
|---|---|---|
| Angular web | Screens, forms, navigation, API calls | None |
| API Gateway | Single API entry point, routing, CORS, token validation or delegation to Spring Security | None |
| Eureka Server | Service registry | Registry metadata only |
| Keycloak | Login, identity, roles, token issuance | Identity realm/config |
| Customer Service | Customer profile and search | Customer tables |
| Product Service | Insurance product definitions and rules | Product tables |
| Policy Service | Policy issuance, coverage dates, status, renewals | Policy tables; references customer/product IDs |
| Claims Service | Claim intake, assessment status, claim notes | Claim tables |
| Payment Service | Payment records and reconciliation status | Payment tables |
| PostgreSQL | Persistent relational storage | Prefer separate database/schema ownership per service |

Do not allow one service to write another service's tables. Use service APIs for cross-service queries. For a demo, a single PostgreSQL server with separate databases or schemas is acceptable, but keep ownership boundaries clear. Cross-service operations are not one giant ACID transaction; use explicit status transitions and compensating actions where needed.

### Important implementation decisions
- Use REST APIs first. Document requests/responses and error shapes.
- Use UUID identifiers for public API resources.
- Store money as `NUMERIC(19,2)` or integer minor units; never use floating point for money.
- Store timestamps consistently in UTC (`timestamptz` in PostgreSQL); display in the user's local timezone.
- Keep policy/claim status changes explicit and validated on the server.
- Do not duplicate customer PII into every service without a clear need.
- Add pagination, sorting, and validation to list endpoints.
- Return consistent errors (problem details or a documented JSON error structure).
- Add audit records for policy issuance, claim decisions, payment changes, and role-sensitive actions.

## 5. Database and migration strategy

Use Flyway migrations checked into each service's source tree, for example:

```text
services/customer-service/src/main/resources/db/migration/
  V1__create_customers.sql
  V2__add_customer_search_indexes.sql
```

Rules:
1. Never rely on Hibernate `ddl-auto=update` in shared environments. Use `validate` (or `none` where appropriate) and Flyway for schema changes.
2. A migration is applied once per database/schema and recorded in `flyway_schema_history`; it is not manually rerun on every startup.
3. Never edit a migration that has already been applied in a shared environment. Add a new migration.
4. Keep migrations backward-compatible when old and new application versions may overlap.
5. Test migrations against a clean database and, where practical, a database containing prior-version data.
6. Use a separate database/schema and migration history for each service that owns its data.
7. Never put real production credentials in Git. Use `.env` locally and a secrets manager in production.

Initial table concepts:
- Customer: id, customer_number, full_name, email, phone, address, status, created_at, updated_at.
- Product: id, code, name, description, premium_basis, coverage_rules, active, created_at.
- Policy: id, policy_number, customer_id, product_id, start_date, end_date, premium_amount, currency, status, created_at.
- Claim: id, claim_number, policy_id, incident_date, description, claimed_amount, approved_amount, status, created_at, updated_at.
- Payment: id, policy_id, claim_id nullable, amount, currency, payment_method_reference (non-sensitive), status, paid_at, created_at.
- Audit event: id, actor_subject, action, resource_type, resource_id, occurred_at, correlation_id, safe metadata.

Do not store passwords in application tables. Do not store full payment card details.

## 6. Identity and authorization

Configure Keycloak realm `insurance`, then create:
- Angular public client with Authorization Code Flow + PKCE.
- API audience/resource configuration appropriate to the selected Keycloak/Spring Security setup.
- Roles such as `ADMIN`, `UNDERWRITER`, `CLAIMS_OFFICER`, `FINANCE_OFFICER`, `CUSTOMER_SERVICE`, and optionally `READ_ONLY`.
- Test users for each role (development only).

Authorization matrix (adjust with the business owner):

| Capability | Admin | Underwriter | Claims officer | Finance officer | Customer service |
|---|---:|---:|---:|---:|---:|
| View dashboard | Yes | Yes | Yes | Yes | Yes |
| Manage users/roles | Yes | No | No | No | No |
| Manage products | Yes | Yes | No | No | No |
| Manage customers | Yes | Yes | Limited | Limited | Yes |
| Create/issue policies | Yes | Yes | No | No | Limited |
| Review claims | Yes | No | Yes | No | Read-only |
| Record payments | Yes | No | No | Yes | Read-only |
| View audit log | Yes | Limited | Limited | Limited | No |

Enforce access in Spring Security and service methods. Hiding a button in Angular is not security. Validate issuer, audience, signature, expiry, and roles/authorities. Keep secrets and admin credentials out of frontend code and source control.

## 7. UI design system

Use a calm, professional insurance dashboard: **light background + one consistent primary color**.

Suggested tokens:
- App background: `#F5F7FB`
- Surface/card: `#FFFFFF`
- Primary (blue): `#2457C5`
- Primary hover: `#1D46A0`
- Main text: `#172033`
- Secondary text: `#667085`
- Border: `#E3E8F0`
- Success: `#16805D`
- Warning: `#B76E00`
- Danger: `#C0362C`
- Focus ring: `#91B4FF`

Rules:
- Use primary blue for primary actions, links, selected navigation, and focus—not for every decorative element.
- Use status colors only for statuses and alerts.
- Create shared Angular components: app shell, sidebar, top bar, page header, card, data table, status badge, form field, confirmation dialog, empty state, loading state, and error state.
- **Mandatory 4-file structure for every component/feature:** Each Angular feature/component must consist of 4 dedicated files: `.html` (template), `.ts` (component logic), `.css` (styling), and `.spec.ts` (unit tests). Inline templates or inline styles are prohibited.
- Keep spacing, typography, border radius, shadows, and button heights consistent through CSS variables/design tokens.
- Ensure keyboard focus, labels, contrast, responsive layouts, and readable error messages.
- Avoid gradients, random colors, excessive shadows, and one-off component styles.

## 8. API outline

Use `/api/v1` and publish OpenAPI docs.

- `GET /api/v1/customers?page=0&size=20&search=...`
- `POST /api/v1/customers`
- `GET /api/v1/customers/{id}`
- `PUT /api/v1/customers/{id}`
- `GET /api/v1/products`
- `POST /api/v1/products`
- `POST /api/v1/policies`
- `GET /api/v1/policies/{id}`
- `POST /api/v1/policies/{id}/renew`
- `POST /api/v1/claims`
- `POST /api/v1/claims/{id}/decision`
- `POST /api/v1/payments`
- `GET /api/v1/dashboard/summary`

Use DTOs, not JPA entities, as public request/response bodies. Validate input and return suitable HTTP status codes. Avoid exposing internal stack traces.

## 9. Delivery phases

### Phase 0 — Discovery and skeleton
- Confirm users, business rules, policy lifecycle, claim lifecycle, and demo acceptance criteria.
- Create repository, branching rules, README, architecture diagram, `.env.example`, and task tracking.
- Choose and pin compatible dependency/image versions.
- Establish code format, linting, and CI checks.

**Exit gate:** a new developer can understand the architecture and start the skeleton.

### Phase 1 — UX foundation and authentication
- Create Angular app shell, routes, sidebar, top bar, light design tokens, responsive layout.
- Set up Keycloak realm/client/roles and login/logout.
- Protect Angular routes for user experience and protect APIs on the backend.
- Create shared loading, error, empty, and forbidden states.

**Exit gate:** a user can sign in and sees navigation appropriate to their role; direct API calls are protected.

### Phase 2 — Database and customer/product vertical slice
- Create PostgreSQL configuration and Flyway migrations.
- Implement customer CRUD/search with validation, pagination, and tests.
- Implement product CRUD and product list.
- Connect Angular forms/tables to real APIs.

**Exit gate:** create/edit/search works end-to-end with data persisting after restart.

### Phase 3 — Policies
- Implement policy issuance, numbering, premium validation, date rules, and status transitions.
- Build policy list/detail/create screens.
- Add authorization and audit events.
- Test invalid dates, duplicate numbers, missing customers/products, and permission boundaries.

**Exit gate:** authorized staff can issue and view a policy.

### Phase 4 — Claims and payments
- Implement claim registration, review, decision, and notes.
- Implement payment records and status handling.
- Add cross-service lookups with timeouts and clear failure behavior.
- Avoid pretending an external payment has happened; the MVP records a payment entry only.

**Exit gate:** a full demo workflow can be completed without database hand-editing.

### Phase 5 — Dashboard, quality, and hardening
- Add dashboard counts from APIs, recent activity, filters, and basic reporting.
- Add API/UI tests, accessibility checks, validation messages, logging, health checks, and seed data.
- Verify pagination, authorization, and audit coverage.
- Add backup/restore notes and error handling.

**Exit gate:** core workflow passes the acceptance checklist.

### Phase 6 — Docker and service discovery
- Add a Dockerfile for each runnable application and a Compose file.
- Start PostgreSQL, Keycloak, Eureka, services, gateway, and frontend with health checks and explicit dependency readiness.
- Use service names on the Docker network, never `localhost` between containers.
- Configure Eureka client URLs using the Compose service name.
- Add persistent volumes for local PostgreSQL/Keycloak data where appropriate.
- Provide `docker compose up --build` and reset instructions.
- Ensure migrations run safely and once per service database/schema.

**Exit gate:** clean clone + documented environment + Docker Compose starts the application and demo workflow works.

### Phase 7 — Demo and handover
- Add realistic but fictional seed data.
- Prepare a 5-minute demo script, screenshots, architecture diagram, API docs, and troubleshooting notes.
- Document known limitations and next steps honestly.
- Never use real customer data in the demo.

**Exit gate:** a manager can run the project, sign in, follow the workflow, and understand the architecture.

## 10. Definition of done

A feature is done only when:
- Backend validation and authorization exist.
- Database changes are versioned by Flyway.
- Success, empty, loading, and error UI states exist.
- Frontend components/features contain all 4 required files (`.html`, `.ts`, `.css`, and `.spec.ts`).
- Tests cover the main path and important failure paths.
- API docs and README are updated.
- No secrets, real PII, or debug credentials are committed.
- The feature runs locally and in Docker Compose.

## 11. Final acceptance checklist

- [x] Login/logout through Keycloak works.
- [x] Roles are enforced by backend APIs.
- [x] Dashboard uses live backend data.
- [x] Customer and product workflows work.
- [x] Policy creation and lifecycle validation work.
- [x] Claim registration and decision workflow work.
- [x] Payment records are searchable and auditable.
- [x] PostgreSQL data survives container restarts.
- [x] Flyway migrations run cleanly and are tracked.
- [x] Eureka shows expected service registrations.
- [x] Gateway routes to services.
- [x] Docker Compose startup and reset are documented.
- [x] UI is light, consistent, responsive, and accessible.
- [x] Tests, API docs, screenshots, and demo instructions are included.
