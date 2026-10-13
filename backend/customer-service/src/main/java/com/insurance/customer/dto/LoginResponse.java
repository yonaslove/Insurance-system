package com.insurance.customer.dto;

import java.util.UUID;

public record LoginResponse(
    UUID id,
    String username,
    String email,
    String fullName,
    String role,
    UUID customerId,
    String token,
    String redirectUrl,
    String status
) {}
