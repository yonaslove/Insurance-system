package com.insurance.payment.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public record PaymentDto(
    UUID id,
    String paymentReference,
    UUID policyId,
    UUID claimId,
    BigDecimal amount,
    String currency,
    String paymentMethodReference,
    String status,
    OffsetDateTime paidAt,
    OffsetDateTime createdAt
) {}
