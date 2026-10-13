package com.insurance.claims.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import java.math.BigDecimal;

public record ClaimDecisionRequest(
    @NotBlank(message = "Decision status is mandatory")
    @Pattern(regexp = "APPROVED|REJECTED", message = "Decision status must be either APPROVED or REJECTED")
    @JsonAlias("status")
    String decision,

    @DecimalMin(value = "0.00", message = "Approved amount cannot be negative")
    @JsonAlias("settlementAmount")
    BigDecimal approvedAmount,

    @NotBlank(message = "Reviewer notes are mandatory")
    String reviewerNotes
) {}
