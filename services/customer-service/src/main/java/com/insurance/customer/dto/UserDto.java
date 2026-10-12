package com.insurance.customer.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record UserDto(
    UUID id,
    String username,
    String email,
    String fullName,
    String role,
    UUID customerId,
    String status,
    OffsetDateTime createdAt
) {}
