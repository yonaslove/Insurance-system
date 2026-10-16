package com.insurance.customer.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record AdminUpdateUserRequest(
        @NotBlank(message = "Full name is required")
        String fullName,

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        String email,

        @NotBlank(message = "Role is required")
        String role,

        @NotBlank(message = "Status is required")
        String status,

        String newPassword,

        Boolean unlockAccount
) {}
