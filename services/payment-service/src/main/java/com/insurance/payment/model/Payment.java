package com.insurance.payment.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "payments")
public class Payment {

    @Id
    @Column(nullable = false, updatable = false)
    private UUID id;

    @Column(name = "payment_reference", nullable = false, unique = true, length = 50)
    private String paymentReference;

    @Column(name = "policy_id", nullable = false)
    private UUID policyId;

    @Column(name = "claim_id")
    private UUID claimId;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, length = 10)
    private String currency;

    @Column(name = "payment_method_reference", nullable = false, length = 255)
    private String paymentMethodReference;

    @Column(nullable = false, length = 20)
    private String status;

    @Column(name = "paid_at", nullable = false)
    private OffsetDateTime paidAt;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    public Payment() {}

    public Payment(UUID id, String paymentReference, UUID policyId, UUID claimId, BigDecimal amount, String currency, String paymentMethodReference, String status, OffsetDateTime paidAt, OffsetDateTime createdAt) {
        this.id = id;
        this.paymentReference = paymentReference;
        this.policyId = policyId;
        this.claimId = claimId;
        this.amount = amount;
        this.currency = currency;
        this.paymentMethodReference = paymentMethodReference;
        this.status = status;
        this.paidAt = paidAt;
        this.createdAt = createdAt;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getPaymentReference() { return paymentReference; }
    public void setPaymentReference(String paymentReference) { this.paymentReference = paymentReference; }

    public UUID getPolicyId() { return policyId; }
    public void setPolicyId(UUID policyId) { this.policyId = policyId; }

    public UUID getClaimId() { return claimId; }
    public void setClaimId(UUID claimId) { this.claimId = claimId; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getPaymentMethodReference() { return paymentMethodReference; }
    public void setPaymentMethodReference(String paymentMethodReference) { this.paymentMethodReference = paymentMethodReference; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public OffsetDateTime getPaidAt() { return paidAt; }
    public void setPaidAt(OffsetDateTime paidAt) { this.paidAt = paidAt; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}
