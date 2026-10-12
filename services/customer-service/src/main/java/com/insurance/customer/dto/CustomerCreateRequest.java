package com.insurance.customer.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;

public record CustomerCreateRequest(
    @NotBlank(message = "First name is mandatory")
    @Size(max = 100)
    String firstName,

    @NotBlank(message = "Last name is mandatory")
    @Size(max = 100)
    String lastName,

    @NotBlank(message = "Email is mandatory")
    @Email(message = "Email must be well-formed")
    String email,

    @NotBlank(message = "Phone number is mandatory")
    @Size(max = 50)
    String phone,

    @NotBlank(message = "Address is mandatory")
    String address,

    LocalDate dateOfBirth,
    String gender,
    String idType,
    String idNumber,
    String occupation,
    BigDecimal annualIncome,
    String emergencyContactName,
    String emergencyContactPhone
) {}
