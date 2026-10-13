package com.insurance.claims.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

public record ClaimDto(
    UUID id,
    String claimNumber,
    UUID policyId,
    LocalDate incidentDate,
    String description,
    BigDecimal claimedAmount,
    BigDecimal approvedAmount,
    String status,
    String reviewerNotes,
    OffsetDateTime createdAt,
    OffsetDateTime updatedAt
) {}
