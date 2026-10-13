package com.insurance.policy.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

public record PolicyDto(
    UUID id,
    String policyNumber,
    UUID customerId,
    UUID productId,
    LocalDate startDate,
    LocalDate endDate,
    BigDecimal premiumAmount,
    String currency,
    String status,
    OffsetDateTime createdAt
) {}
