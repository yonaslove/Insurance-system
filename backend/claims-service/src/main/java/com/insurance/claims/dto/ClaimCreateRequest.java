package com.insurance.claims.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record ClaimCreateRequest(
    @NotNull(message = "Policy ID is mandatory")
    UUID policyId,

    @NotNull(message = "Incident date is mandatory")
    LocalDate incidentDate,

    @NotBlank(message = "Incident description is mandatory")
    String description,

    @NotNull(message = "Claimed damage amount is mandatory")
    @DecimalMin(value = "0.01", message = "Claimed amount must be positive")
    BigDecimal claimedAmount
) {}
