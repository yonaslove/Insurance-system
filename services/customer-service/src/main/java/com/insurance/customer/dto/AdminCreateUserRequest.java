package com.insurance.customer.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AdminCreateUserRequest(
    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    String username,

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    String password,

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    String email,

    @NotBlank(message = "Full name is required")
    String fullName,

    @NotBlank(message = "Role is required")
    String role, // 'ADMIN', 'UNDERWRITER', 'CLAIMS_OFFICER', 'FINANCE_OFFICER', 'CUSTOMER_SERVICE', 'CUSTOMER'

    String phone,
    String address
) {}
