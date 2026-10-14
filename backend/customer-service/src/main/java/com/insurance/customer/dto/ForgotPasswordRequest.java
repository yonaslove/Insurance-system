package com.insurance.customer.dto;

import jakarta.validation.constraints.NotBlank;

public record ForgotPasswordRequest(
        @NotBlank(message = "Username or email is required")
        String usernameOrEmail
) {}
