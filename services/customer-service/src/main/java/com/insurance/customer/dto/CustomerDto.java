package com.insurance.customer.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

public record CustomerDto(
    UUID id,
    String customerNumber,
    String firstName,
    String lastName,
    String email,
    String phone,
    String address,
    String status,
    LocalDate dateOfBirth,
    String gender,
    String idType,
    String idNumber,
    String occupation,
    BigDecimal annualIncome,
    String emergencyContactName,
    String emergencyContactPhone,
    String rejectionReason,
    OffsetDateTime createdAt,
    OffsetDateTime updatedAt
) {}
