package com.insurance.payment.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.UUID;

public record PaymentCreateRequest(
    @NotNull(message = "Policy ID is mandatory")
    UUID policyId,

    UUID claimId,

    @NotNull(message = "Payment amount is mandatory")
    @DecimalMin(value = "0.01", message = "Payment amount must be positive")
    BigDecimal amount,

    @NotBlank(message = "Currency is mandatory")
    String currency,

    @NotBlank(message = "Masked payment method reference is mandatory")
    String paymentMethodReference,

    @Size(max = 100, message = "Idempotency key must not exceed 100 characters")
    String idempotencyKey
) {}
