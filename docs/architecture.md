# Insurance Management System — Architecture

## Overview
The Insurance Management System is designed as an enterprise microservice platform with an Angular frontend, backed by Spring Boot microservices, Keycloak identity management, PostgreSQL for relational storage, and Spring Cloud Gateway for unified ingress routing.

```
                      +-----------------------------+
                      |   Browser / Angular Web     |
                      |    (Port 4200 / Docker)     |
                      +--------------+--------------+
                                     |
                                     v
                      +-----------------------------+
                      |     Spring Cloud Gateway    |
                      |          (Port 8080)        |
                      +--------------+--------------+
                                     |
       +-----------------------------+-----------------------------+
       |                             |                             |
       v                             v                             v
+---------------+             +---------------+             +---------------+
| Customer Svc  |             |  Product Svc  |             |  Policy Svc   |
|  (Port 8081)  |             |  (Port 8082)  |             |  (Port 8083)  |
+---------------+             +---------------+             +---------------+
       |                             |                             |
       +-----------------------------+-----------------------------+
                                     |
       +-----------------------------+-----------------------------+
       |                             |                             |
       v                             v                             v
+---------------+             +---------------+             +---------------+
|  Claims Svc   |             |  Payment Svc  |             | Eureka Server |
|  (Port 8084)  |             |  (Port 8085)  |             |  (Port 8761)  |
+---------------+             +---------------+             +---------------+
                                     |
                      +-----------------------------+
                      |    PostgreSQL Databases     |
                      |   (Separate Schemas/DBs)    |
                      +-----------------------------+
```

## Core Standards
1. **Frontend**: Angular standalone components, TypeScript, Reactive Forms, 4-file structure per component (`.html`, `.ts`, `.css`, `.spec.ts`).
2. **Backend**: Spring Boot LTS, Java 21 LTS, Spring Security OAuth2 Resource Server, Flyway migrations, Bean Validation.
3. **Identity**: Keycloak OIDC, Authorization Code Flow + PKCE.
4. **Data Isolation**: Services own their respective schemas/databases; no direct cross-database table writes.
5. **Precision**: Money represented strictly with `NUMERIC(19,2)`; timestamps in UTC (`timestamptz`).
