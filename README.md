# Insurance Management System (InsurEdge Enterprise)

A robust, enterprise-grade Insurance Management System built with Angular 18 and Spring Boot 3.3.4 microservices. The entire application operates exclusively on a **real PostgreSQL database** with Flyway migrations—**all mock data and fake persona switchers have been completely removed**.

---

## 🏛️ System Architecture

- **Frontend**: Angular 18 Single-Page Application (standalone components strictly adhering to the 4-file structure: `.html`, `.ts`, `.css`, `.spec.ts`).
- **Backend Services**: Java 21, Spring Boot 3.3.4, Spring Cloud Gateway, Netflix Eureka Service Discovery, Spring Data JPA, Hibernate, Bean Validation.
- **Identity & Authentication**: Real database credentials stored in PostgreSQL `app_users` table managed via Flyway `V2__add_users_auth_and_roles.sql`.
- **Database Architecture**: Dedicated PostgreSQL databases per domain microservice (`customer_db`, `product_db`, `policy_db`, `claims_db`, `payment_db`, `keycloak_db`).
- **Containerization**: Docker Compose with multi-stage production builds (Eclipse Temurin JRE 21 + NGINX on Alpine).

---

## 🔐 Real Database Authentication & Actor Workflow

### Only One Initial User: Administrator
Only the **System Administrator** is pre-seeded in the database to bootstrap the system:
- **Username**: `admin`
- **Email**: `admin@insurance-corp.com`
- **Password**: `Admin123!`
- **Role**: `ADMIN`

### How All Other Actors Are Created:
1. **Administrative Staff Provisioning**:
   - The Administrator logs in and opens the **Actor Provisioning** console ([`/admin/users`](http://localhost:4200/admin/users)).
   - The Administrator can create any staff actor:
     - **Underwriters** (`UNDERWRITER`): Policy review and issuance ([`/policies`](http://localhost:4200/policies), [`/products`](http://localhost:4200/products))
     - **Claims Officers** (`CLAIMS_OFFICER`): Claims investigation and adjudication ([`/claims`](http://localhost:4200/claims))
     - **Finance Officers** (`FINANCE_OFFICER`): Premium recording and ledger tracking ([`/payments`](http://localhost:4200/payments))
     - **Customer Service** (`CUSTOMER_SERVICE`): Client directory management ([`/customers`](http://localhost:4200/customers))
     - **Administrators** (`ADMIN`): Full governance and user provisioning
   - Each created actor is saved directly into the PostgreSQL database (`app_users`) and can immediately log in with their assigned credentials.
2. **Customer Self-Registration**:
   - Policyholders / Customers do not need an administrator to create their account.
   - Customers register directly on the **Customer Registration** page ([`/register`](http://localhost:4200/register)).
   - Submitting the form saves both the customer profile into `customers` table and their login account into `app_users` table with role `CUSTOMER`.
   - The customer is automatically authenticated and lands in their dedicated **Insurance Portal** ([`/portal`](http://localhost:4200/portal)).

---

## 📂 Professional Project Folder Structure

```text
insurance/
├── frontend/
│   └── insurance-web/                             # Angular 18 Single-Page Application
│       ├── src/
│       │   ├── app/
│       │   │   ├── core/                          # Singletons (Guards, Models, Services)
│       │   │   │   ├── guards/
│       │   │   │   │   ├── auth.guard.ts          # Redirects unauthenticated visits to /login
│       │   │   │   │   └── role.guard.ts          # Role-Based Access Control (RBAC) guard
│       │   │   │   ├── models/                    # Domain models & DTO contracts
│       │   │   │   │   ├── user.model.ts          # UserProfile, UserRole, UserAccount
│       │   │   │   │   ├── customer.model.ts      # Customer domain model & DTOs
│       │   │   │   │   ├── product.model.ts       # Product domain model & DTOs
│       │   │   │   │   ├── policy.model.ts        # Policy domain model & DTOs
│       │   │   │   │   ├── claim.model.ts         # Claim domain model & DTOs
│       │   │   │   │   ├── payment.model.ts       # Payment domain model & DTOs
│       │   │   │   │   └── dashboard.model.ts     # Executive aggregate model
│       │   │   │   └── services/
│       │   │   │       ├── auth.service.ts        # Real DB auth (/api/v1/auth)
│       │   │   │       └── insurance-data.service.ts # Real microservice HTTP data store
│       │   │   ├── features/                      # Domain Features (Strict 4-file structure)
│       │   │   │   ├── auth/
│       │   │   │   │   ├── login/                 # Database credential sign-in
│       │   │   │   │   └── register/              # Customer self-registration form
│       │   │   │   ├── customer-portal/           # Customer self-service (policies, claims, receipts)
│       │   │   │   ├── admin/
│       │   │   │   │   └── user-management/       # Admin actor provisioning & staff management
│       │   │   │   ├── dashboard/                 # Executive KPI overview & system health
│       │   │   │   ├── customers/                 # Customer directory & creation
│       │   │   │   ├── products/                  # Insurance plan catalog & setup
│       │   │   │   ├── policies/                  # Policy issuance & underwriting workbench
│       │   │   │   ├── claims/                    # Claims registration & adjuster review
│       │   │   │   └── payments/                  # Payment recording & treasury ledger
│       │   │   ├── layout/                        # App Shell & Navigation
│       │   │   │   ├── shell/                     # Layout wrapper for authenticated routes
│       │   │   │   ├── sidebar/                   # Role-filtered sidebar & user session card
│       │   │   │   └── topbar/                    # Active user info, role badge & sign-out
│       │   │   └── shared/                        # Reusable UI component library
│       │   │       └── components/                # Button, Card, Badge, Alert, StatCard, etc.
│       │   ├── styles.css                         # Design tokens, variables & typography
│       │   ├── app.routes.ts                      # Route table with authentication guards
│       │   └── main.ts                            # Bootstrap entry
│       ├── nginx.conf                             # Production reverse proxy configuration
│       ├── Dockerfile                             # Multi-stage container build (Node 20 + NGINX)
│       └── package.json                           # Dependencies & scripts
│
├── services/                                      # Microservices Backend (Spring Boot 3.3 / Java 21)
│   ├── discovery-server/                          # Netflix Eureka Service Discovery (Port 8761)
│   ├── api-gateway/                               # Spring Cloud Gateway (Port 8080)
│   │   └── src/main/resources/application.yml     # Reverse proxy routes (/api/v1/auth/**, etc.)
│   ├── customer-service/                          # Identity, Auth & Customer Service (Port 8081)
│   │   ├── src/main/java/com/insurance/customer/
│   │   │   ├── controller/
│   │   │   │   ├── AuthController.java            # /api/v1/auth: login, register, users
│   │   │   │   └── CustomerController.java        # /api/v1/customers: list, create, search
│   │   │   ├── service/
│   │   │   │   ├── AuthUserService.java           # Real DB authentication & provisioning
│   │   │   │   └── CustomerService.java           # Customer lifecycle management
│   │   │   ├── repository/
│   │   │   │   ├── UserRepository.java            # app_users queries
│   │   │   │   └── CustomerRepository.java        # customers queries
│   │   │   ├── model/
│   │   │   │   ├── User.java                      # User entity with DB credentials & role
│   │   │   │   └── Customer.java                  # Customer entity
│   │   │   └── dto/                               # Validated request and response records
│   │   └── src/main/resources/db/migration/
│   │       ├── V1__init_customer_schema.sql       # Baseline customer schema
│   │       └── V2__add_users_auth_and_roles.sql   # Flyway user schema & initial admin seed
│   ├── product-service/                           # Product catalog microservice (Port 8082)
│   ├── policy-service/                            # Policy lifecycle & issuance (Port 8083)
│   ├── claims-service/                            # Claims intake & settlement (Port 8084)
│   └── payment-service/                           # Payment recording & ledger (Port 8085)
│
├── infra/                                         # Infrastructure & Deployment Assets
│   ├── postgres/
│   │   └── init-databases.sql                     # Multi-database init script (PostgreSQL 16)
│   └── keycloak/
│       └── insurance-realm.json                   # OIDC realm definition
│
├── docker-compose.yml                             # Complete local stack orchestration
└── README.md                                      # Documentation & execution runbook
```

---

## 🚀 Running the Application

### 1. Launch with Docker Compose
```bash
docker compose up --build
```

### 2. Verified Entry Points
- **Web Portal**: [`http://localhost:4200`](http://localhost:4200) (Requires login first)
- **API Gateway**: `http://localhost:8080`
- **Eureka Discovery**: `http://localhost:8761`

### 3. Step-by-Step Test Workflow
1. Navigate to `http://localhost:4200/login`.
2. Sign in as Administrator:
   - Username: `admin`
   - Password: `Admin123!`
3. In the sidebar, click **"Actor Provisioning"** ([`/admin/users`](http://localhost:4200/admin/users)).
4. Click **"Provision New Actor / Customer"** to add real staff members (Underwriter, Claims Officer, Finance Officer) or new Customers with their database passwords.
5. Alternatively, open `http://localhost:4200/register` to test **Customer Self-Registration**. The customer account is created directly in the database and logs into the **Customer Portal** ([`/portal`](http://localhost:4200/portal)).
