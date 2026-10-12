# API Contracts — Insurance Management System

Base path for all services routed through the API Gateway: `/api/v1`

## 1. Customer Service (`/api/v1/customers`)
- `GET /api/v1/customers?page=0&size=20&search=John`
  - Response: `Page<CustomerDto>`
- `POST /api/v1/customers`
  - Body: `{ customerNumber, firstName, lastName, email, phone, address }`
  - Response: `CustomerDto` (201 Created)
- `GET /api/v1/customers/{id}`
  - Response: `CustomerDto`
- `PUT /api/v1/customers/{id}`
  - Body: `{ firstName, lastName, email, phone, address, status }`
  - Response: `CustomerDto`

## 2. Product Service (`/api/v1/products`)
- `GET /api/v1/products`
  - Response: `List<ProductDto>`
- `POST /api/v1/products`
  - Body: `{ code, name, description, category, basePremium, active }`
  - Response: `ProductDto` (201 Created)
- `GET /api/v1/products/{id}`
  - Response: `ProductDto`

## 3. Policy Service (`/api/v1/policies`)
- `GET /api/v1/policies?page=0&size=20&status=ACTIVE`
  - Response: `Page<PolicyDto>`
- `POST /api/v1/policies`
  - Body: `{ customerId, productId, startDate, endDate, premiumAmount, currency }`
  - Response: `PolicyDto` (201 Created)
- `GET /api/v1/policies/{id}`
  - Response: `PolicyDto`
- `POST /api/v1/policies/{id}/renew`
  - Body: `{ newEndDate, adjustedPremium }`
  - Response: `PolicyDto`

## 4. Claims Service (`/api/v1/claims`)
- `GET /api/v1/claims?page=0&size=20&status=SUBMITTED`
  - Response: `Page<ClaimDto>`
- `POST /api/v1/claims`
  - Body: `{ policyId, incidentDate, description, claimedAmount }`
  - Response: `ClaimDto` (201 Created)
- `GET /api/v1/claims/{id}`
  - Response: `ClaimDto`
- `POST /api/v1/claims/{id}/decision`
  - Body: `{ decision: "APPROVED" | "REJECTED", approvedAmount, reviewerNotes }`
  - Response: `ClaimDto`

## 5. Payment Service (`/api/v1/payments`)
- `GET /api/v1/payments?page=0&size=20`
  - Response: `Page<PaymentDto>`
- `POST /api/v1/payments`
  - Body: `{ policyId, claimId?, amount, currency, paymentMethodRef, idempotencyKey }`
  - Response: `PaymentDto` (201 Created)

## 6. Dashboard (`/api/v1/dashboard/summary`)
- `GET /api/v1/dashboard/summary`
  - Response: `{ totalCustomers, activePolicies, pendingClaims, recordedPaymentsTotal, recentActivities: [...] }`
