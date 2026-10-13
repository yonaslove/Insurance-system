package com.insurance.product.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public record ProductDto(
    UUID id,
    String code,
    String name,
    String description,
    String category,
    BigDecimal basePremium,
    Boolean active,
    OffsetDateTime createdAt
) {}
