package com.insurance.customer.dto;

public record ForgotPasswordResponse(
        String message,
        String email,
        String resetCode
) {}
