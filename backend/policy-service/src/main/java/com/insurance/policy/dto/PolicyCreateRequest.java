package com.insurance.policy.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record PolicyCreateRequest(
    @NotNull(message = "Customer ID is required")
    UUID customerId,

    @NotNull(message = "Product ID is required")
    UUID productId,

    @NotNull(message = "Start date is required")
    LocalDate startDate,

    @NotNull(message = "End date is required")
    LocalDate endDate,

    @NotNull(message = "Premium amount is required")
    @DecimalMin(value = "0.01", message = "Premium amount must be positive")
    BigDecimal premiumAmount,

    @NotBlank(message = "Currency is required")
    String currency
) {}
