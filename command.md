# Agent Command — Insurance Management System

Copy the full prompt below into your coding agent from the root of the repository. It is written to make the agent inspect the existing code first, work incrementally, and verify rather than merely generate files.

---

## Master implementation prompt

You are the senior full-stack engineer responsible for implementing a professional Insurance Management System for an insurance company. Follow `roadmap.md` and `todo.md` as the source of truth. Use Angular for the frontend and Java + Spring Boot for backend services. The system must have a light, consistent UI and a reproducible Docker-based local environment.

### Required stack
- Angular + TypeScript, standalone components, routing, Reactive Forms, HttpClient.
- Mandatory Frontend Structure: Each frontend feature and component must strictly contain all 4 files: `.html`, `.ts`, `.css`, and `.spec.ts` / test file.
- Java LTS compatible with the selected Spring Boot version.
- Spring Boot, Spring Security, Spring Data JPA, Bean Validation, OpenAPI.
- PostgreSQL for persistent relational data.
- Flyway for versioned schema migrations. Do not use Hibernate `ddl-auto=update`.
- Keycloak with OIDC; Angular Authorization Code Flow with PKCE; backend JWT validation.
- Spring Cloud Eureka for service discovery.
- Spring Cloud Gateway as the single API entry point.
- Dockerfiles and Docker Compose with health checks and persistent database volumes.
- Automated tests for backend business rules, authorization, API integration, and critical frontend flows.

Pin compatible versions; do not blindly use `latest`. Inspect the repository and installed toolchain before choosing versions.

### Non-negotiable UI rules
Use a light professional insurance dashboard. Define shared CSS variables/design tokens once and reuse them across every screen:
- Background `#F5F7FB`
- Surface `#FFFFFF`
- Primary `#2457C5`
- Primary hover `#1D46A0`
- Main text `#172033`
- Secondary text `#667085`
- Border `#E3E8F0`
- Success `#16805D`
- Warning `#B76E00`
- Danger `#C0362C`
- Focus ring `#91B4FF`

Create reusable components for buttons, cards, forms, tables, status badges, page headers, dialogs, loading states, empty states, and error states. Use primary blue consistently for main actions and navigation; do not invent a different color per page. Make the interface responsive and keyboard accessible. Avoid gradients, excessive shadows, inconsistent spacing, and placeholder-looking pages.

### Functional scope
Implement these end-to-end workflows:
1. Login/logout and role-aware navigation.
2. Dashboard backed by real API data.
3. Customer create/read/update/search.
4. Insurance product management.
5. Policy issuance, listing, detail, and permitted lifecycle transitions.
6. Claim intake, review, decision, and notes.
7. Payment recording and payment history.
8. Audit events for sensitive operations.

Use roles `ADMIN`, `UNDERWRITER`, `CLAIMS_OFFICER`, `FINANCE_OFFICER`, `CUSTOMER_SERVICE`, and `READ_ONLY`. Enforce authorization on the backend. Angular route guards and hidden buttons are only UX controls, never the security boundary.

### Architecture rules
Use clear service ownership:
- `customer-service`: customer data.
- `product-service`: insurance products.
- `policy-service`: policy lifecycle.
- `claims-service`: claim lifecycle.
- `payment-service`: payment records.
- `discovery-server`: Eureka.
- `api-gateway`: routes and API entry point.
- `frontend`: Angular.
- Keycloak: identity and roles.
- PostgreSQL: persistent storage.

If the existing project/team constraints make separate services impractical, explain the tradeoff and keep domain modules clean; do not silently replace required microservices with a monolith. Do not let one service directly write another service's tables. Use REST APIs and DTOs. Use UUID IDs, `NUMERIC(19,2)` for monetary values, and `timestamptz` for timestamps. Never use floating point for money.

### Database rules
- Use Flyway SQL migrations stored in each data-owning service.
- A migration must be versioned, repeatable in a clean environment, and tracked in `flyway_schema_history`.
- Never edit an already-applied migration; add a new version.
- Do not configure `ddl-auto=update`.
- Configure database credentials through environment variables, with `.env.example` containing placeholders only.
- Do not commit secrets, actual customer data, or production credentials.
- Use separate database/schema ownership per service; document the selected approach.
- Add constraints and indexes deliberately.
- Seed only fictional demo records.

### Security rules
- Configure Keycloak realm `insurance`, Angular client with Authorization Code + PKCE, and backend JWT validation.
- Validate token issuer, signature, expiry, audience/resource configuration, and authorities.
- Protect sensitive backend methods and endpoints.
- Keep admin credentials and client secrets out of Angular source.
- Do not log access tokens, passwords, or unnecessary personal information.
- Use safe payment references only; never store card numbers/CVV.
- Return 401 for unauthenticated requests and 403 for authenticated but unauthorized requests.
- Use narrow CORS rules for the configured frontend origin.

### Docker rules
- Create multi-stage Dockerfiles where useful.
- Compose must include PostgreSQL, Keycloak, Eureka, gateway, backend services, and Angular frontend.
- Use service DNS names for container-to-container connections, not `localhost`.
- Include health checks and wait for readiness; `depends_on` alone does not guarantee readiness.
- Persist PostgreSQL data in a named volume.
- Configure ports, URLs, and credentials via environment variables.
- Verify Keycloak's issuer URL is consistent for browser and backend access; document any hostname strategy.
- Do not expose database/admin ports publicly in production.
- Document `docker compose up --build`, logs, stop, and safe reset commands.

### Working method — follow in order
1. **Inspect first.** List files, inspect package/build files, identify existing work, and run available tests. Do not overwrite functioning code blindly.
2. **Report the plan.** Give a short list of files to create/change and any version or architecture decisions.
3. **Implement one vertical slice at a time.** Start with project skeleton/design tokens, then database + Flyway + Customer Service, then Keycloak/security, products, policies, claims, payments, dashboard/audit, discovery/gateway, Docker.
4. **Keep `todo.md` current.** Mark an item complete only after its code exists and its verification passes. Record blockers honestly.
5. **Test after each slice.** Run backend tests, frontend tests/lint/build, migration tests where practical, and API smoke tests. Do not claim tests passed if you did not run them.
6. **Fix failures before expanding scope.** Do not bury errors, skip failed tests, or disable security to make the demo work.
7. **Document every setup requirement.** Update README and `.env.example` when configuration changes.
8. **Finish with a handover report.** State implemented features, architecture, exact run commands, ports, test results, remaining TODOs, and known limitations.

### Code quality requirements
- Prefer small, understandable components and services over huge files.
- Strictly adhere to the 4-file structure for every frontend feature/component: template (`.html`), component logic (`.ts`), styling (`.css`), and unit test (`.spec.ts`).
- Separate controller, service/business logic, repository, DTO, validation, and configuration layers.
- Avoid fake data in production UI; mock data is allowed only for explicitly labeled early scaffolding and must be replaced in the working feature.
- Never leave primary buttons inert.
- Do not use placeholder endpoints or claim a feature works without connecting it end-to-end.
- Include clear validation and user-friendly errors.
- Add pagination to growing lists.
- Use transactions within a service's own database boundary.
- Handle timeouts and downstream service failures.
- Keep dependencies minimal and compatible.
- Never silently delete user files, rewrite Git history, or run destructive database/volume commands without warning and explicit approval.

### Acceptance test
The project is not complete until this demo works:
1. Start the documented Docker Compose stack from a clean checkout.
2. Sign in through Keycloak as an authorized demo user.
3. Create a customer.
4. View/create an insurance product.
5. Issue a policy for that customer and product.
6. Register a claim against the policy and perform an authorized decision.
7. Record a payment entry.
8. See real counts/activity on the dashboard.
9. Verify a role without permission gets 403 from the API.
10. Restart containers and verify data remains.
11. Verify Flyway migration history and Eureka service registration.
12. Run and report tests accurately.

Begin by inspecting the repository and toolchain. Do not generate the entire project in one uncontrolled pass. Implement, run, verify, and then continue.

---

## Short follow-up command for each implementation session

After the master prompt has been supplied, use this at the start of each new agent session:

> Read `roadmap.md`, `todo.md`, and `command.md`. Inspect the current repository and Git diff. Select the highest-priority unchecked task whose prerequisites are complete. Implement only that coherent slice, add/update tests and documentation, run the relevant checks, fix failures, and update `todo.md` truthfully. Do not overwrite unrelated work or claim success without verification. End with: files changed, behavior implemented, commands/tests run and results, remaining risks, and the exact next task.
