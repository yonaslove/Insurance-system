package com.insurance.claims.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "claims")
public class Claim {

    @Id
    @Column(nullable = false, updatable = false)
    private UUID id;

    @Column(name = "claim_number", nullable = false, unique = true, length = 50)
    private String claimNumber;

    @Column(name = "policy_id", nullable = false)
    private UUID policyId;

    @Column(name = "incident_date", nullable = false)
    private LocalDate incidentDate;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "claimed_amount", nullable = false, precision = 19, scale = 2)
    private BigDecimal claimedAmount;

    @Column(name = "approved_amount", precision = 19, scale = 2)
    private BigDecimal approvedAmount;

    @Column(nullable = false, length = 20)
    private String status;

    @Column(name = "reviewer_notes", columnDefinition = "TEXT")
    private String reviewerNotes;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    public Claim() {}

    public Claim(UUID id, String claimNumber, UUID policyId, LocalDate incidentDate, String description, BigDecimal claimedAmount, BigDecimal approvedAmount, String status, String reviewerNotes, OffsetDateTime createdAt) {
        this.id = id;
        this.claimNumber = claimNumber;
        this.policyId = policyId;
        this.incidentDate = incidentDate;
        this.description = description;
        this.claimedAmount = claimedAmount;
        this.approvedAmount = approvedAmount;
        this.status = status;
        this.reviewerNotes = reviewerNotes;
        this.createdAt = createdAt;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getClaimNumber() { return claimNumber; }
    public void setClaimNumber(String claimNumber) { this.claimNumber = claimNumber; }

    public UUID getPolicyId() { return policyId; }
    public void setPolicyId(UUID policyId) { this.policyId = policyId; }

    public LocalDate getIncidentDate() { return incidentDate; }
    public void setIncidentDate(LocalDate incidentDate) { this.incidentDate = incidentDate; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public BigDecimal getClaimedAmount() { return claimedAmount; }
    public void setClaimedAmount(BigDecimal claimedAmount) { this.claimedAmount = claimedAmount; }

    public BigDecimal getApprovedAmount() { return approvedAmount; }
    public void setApprovedAmount(BigDecimal approvedAmount) { this.approvedAmount = approvedAmount; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getReviewerNotes() { return reviewerNotes; }
    public void setReviewerNotes(String reviewerNotes) { this.reviewerNotes = reviewerNotes; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }

    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
}
