package com.insurance.customer.dto;

import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record CustomerUpdateRequest(
    @Size(max = 50)
    String phone,

    String address,

    @Size(max = 100)
    String occupation,

    BigDecimal annualIncome,

    @Size(max = 150)
    String emergencyContactName,

    @Size(max = 50)
    String emergencyContactPhone
) {}
