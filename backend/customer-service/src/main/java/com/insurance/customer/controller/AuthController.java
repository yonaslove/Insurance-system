package com.insurance.customer.controller;

import com.insurance.customer.dto.*;
import com.insurance.customer.service.AuthUserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Authentication & User Management", description = "Endpoints for login, customer registration, and admin user administration")
public class AuthController {

    private final AuthUserService authUserService;

    public AuthController(AuthUserService authUserService) {
        this.authUserService = authUserService;
    }

    @PostMapping("/login")
    @Operation(summary = "Authenticate user with exact database credentials and return role-specific redirect URL")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authUserService.login(request));
    }

    @PostMapping("/register")
    @Operation(summary = "Special Case: Customer self-registration with direct login")
    public ResponseEntity<LoginResponse> registerCustomer(@Valid @RequestBody CustomerRegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authUserService.registerCustomer(request));
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Request password reset verification code by username or email")
    public ResponseEntity<ForgotPasswordResponse> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        return ResponseEntity.ok(authUserService.forgotPassword(request));
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Reset account credentials using 6-digit verification code and unlock account")
    public ResponseEntity<Map<String, String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        return ResponseEntity.ok(authUserService.resetPassword(request));
    }

    @PostMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin operation: Add customers or any actor (Underwriter, Claims Officer, etc.) to the system")
    public ResponseEntity<UserDto> createUserByAdmin(@Valid @RequestBody AdminCreateUserRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authUserService.createUserByAdmin(request));
    }

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin operation: List all actors and users in the system (optionally filtered by role)")
    public ResponseEntity<List<UserDto>> listUsers(@RequestParam(required = false) String role) {
        List<UserDto> users = authUserService.listUsers();
        if (role != null && !role.isBlank() && !role.equalsIgnoreCase("ALL")) {
            users = users.stream().filter(u -> role.equalsIgnoreCase(u.role())).toList();
        }
        return ResponseEntity.ok(users);
    }

    @GetMapping("/actors")
    @Operation(summary = "List all supported actor roles and their designated responsibilities")
    public ResponseEntity<List<Map<String, String>>> listActors() {
        List<Map<String, String>> actors = List.of(
            Map.of(
                "role", "ADMIN",
                "title", "System Administrator",
                "responsibility", "Full system governance, executive analytics, user/actor provisioning",
                "defaultRedirect", "/dashboard"
            ),
            Map.of(
                "role", "UNDERWRITER",
                "title", "Senior Underwriter",
                "responsibility", "Policy underwriting, risk assessment, coverage structuring, policy issuance",
                "defaultRedirect", "/policies"
            ),
            Map.of(
                "role", "CLAIMS_OFFICER",
                "title", "Claims Adjudicator",
                "responsibility", "Claims evaluation, incident verification, loss adjustment, settlement approval/rejection",
                "defaultRedirect", "/claims"
            ),
            Map.of(
                "role", "FINANCE_OFFICER",
                "title", "Finance & Treasury Officer",
                "responsibility", "Premium billing collection, settlement disbursement, payment reconciliation",
                "defaultRedirect", "/payments"
            ),
            Map.of(
                "role", "CUSTOMER_SERVICE",
                "title", "Customer Care Representative",
                "responsibility", "Customer onboarding, directory management, contact maintenance, support inquiries",
                "defaultRedirect", "/customers"
            ),
            Map.of(
                "role", "CUSTOMER",
                "title", "Policyholder (Self-Service)",
                "responsibility", "View active policies, submit insurance claims, track claim status, review payment receipts",
                "defaultRedirect", "/portal"
            )
        );
        return ResponseEntity.ok(actors);
    }
}
