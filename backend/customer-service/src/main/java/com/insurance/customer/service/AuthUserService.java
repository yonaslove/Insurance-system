package com.insurance.customer.service;

import com.insurance.customer.dto.*;
import com.insurance.customer.model.Customer;
import com.insurance.customer.model.User;
import com.insurance.customer.repository.CustomerRepository;
import com.insurance.customer.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.insurance.customer.model.PasswordResetToken;
import com.insurance.customer.repository.PasswordResetTokenRepository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class AuthUserService {

    private static final Logger log = LoggerFactory.getLogger(AuthUserService.class);

    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final KeycloakService keycloakService;
    private final PasswordResetTokenRepository tokenRepository;
    private final EmailService emailService;

    public AuthUserService(UserRepository userRepository,
                           CustomerRepository customerRepository,
                           KeycloakService keycloakService,
                           PasswordResetTokenRepository tokenRepository,
                           EmailService emailService) {
        this.userRepository = userRepository;
        this.customerRepository = customerRepository;
        this.keycloakService = keycloakService;
        this.tokenRepository = tokenRepository;
        this.emailService = emailService;
    }

    @Transactional(noRollbackFor = ResponseStatusException.class)
    public LoginResponse login(LoginRequest request) {
        String identifier = request.usernameOrEmail().trim();
        User user = userRepository.findByUsername(identifier)
                .or(() -> userRepository.findByEmail(identifier))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid username/email or password"));

        // 1. Check if account is currently locked due to failed attempts
        if (user.getLockedUntil() != null) {
            if (user.getLockedUntil().isAfter(OffsetDateTime.now())) {
                long minutesLeft = java.time.Duration.between(OffsetDateTime.now(), user.getLockedUntil()).toMinutes() + 1;
                throw new ResponseStatusException(HttpStatus.LOCKED,
                        String.format("Account is temporarily locked due to 5 consecutive failed login attempts. Please try again in %d minute(s) or use 'Forgot Password' to reset your credentials.", minutesLeft));
            } else {
                // Lockout duration has expired; automatically release lock
                user.setLockedUntil(null);
                user.setFailedLoginAttempts(0);
                userRepository.saveAndFlush(user);
            }
        }

        if ("REJECTED".equalsIgnoreCase(user.getStatus())) {
            String reason = user.getRejectionReason() != null ? user.getRejectionReason() : "Failed KYC identity verification criteria";
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Registration application rejected: " + reason);
        }

        if (!"ACTIVE".equalsIgnoreCase(user.getStatus()) && !"PENDING_APPROVAL".equalsIgnoreCase(user.getStatus())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User account is suspended or inactive");
        }

        String redirectUrl = getRedirectUrlForRole(user.getRole());

        // 2. Keycloak is the sole credential authority: validate the password there and obtain a signed JWT.
        KeycloakTokenResponse keycloakToken;
        try {
            keycloakToken = keycloakService.authenticate(user.getUsername(), request.password());
        } catch (ResponseStatusException ex) {
            if (ex.getStatusCode() == HttpStatus.UNAUTHORIZED) {
                int attempts = (user.getFailedLoginAttempts() != null ? user.getFailedLoginAttempts() : 0) + 1;
                user.setFailedLoginAttempts(attempts);
                if (attempts >= 5) {
                    user.setLockedUntil(OffsetDateTime.now().plusMinutes(15));
                    userRepository.saveAndFlush(user);
                    log.warn("Account '{}' locked for 15 minutes due to 5 consecutive failed login attempts", user.getUsername());
                    throw new ResponseStatusException(HttpStatus.LOCKED,
                            "Account is temporarily locked for 15 minutes due to 5 consecutive failed login attempts. Please try again in 15 minutes or use 'Forgot Password'.");
                } else {
                    userRepository.saveAndFlush(user);
                    int remaining = 5 - attempts;
                    throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                            String.format("Invalid username/email or password. %d attempt(s) remaining before account lockout.", remaining));
                }
            }
            throw ex;
        }

        if (keycloakToken == null || keycloakToken.accessToken() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid username/email or password");
        }

        // 3. Reset failed login attempts on successful authentication
        if ((user.getFailedLoginAttempts() != null && user.getFailedLoginAttempts() > 0) || user.getLockedUntil() != null) {
            user.setFailedLoginAttempts(0);
            user.setLockedUntil(null);
            userRepository.save(user);
        }

        String token = keycloakToken.accessToken();

        return new LoginResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFullName(),
                user.getRole(),
                user.getCustomerId(),
                token,
                redirectUrl,
                user.getStatus()
        );
    }

    @Transactional
    public LoginResponse registerCustomer(CustomerRegisterRequest request) {
        if (customerRepository.existsByEmail(request.email().trim())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "A customer with this email already exists");
        }
        if (userRepository.existsByUsername(request.username().trim())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username is already taken");
        }
        if (userRepository.existsByEmail(request.email().trim())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email is already registered");
        }

        // 1. Create customer entity with PENDING_APPROVAL status and full KYC details
        String customerNumber = String.format("CUST-2026-%03d", customerRepository.nextCustomerNumber());
        UUID customerId = UUID.randomUUID();

        Customer customer = new Customer(
                customerId,
                customerNumber,
                request.firstName().trim(),
                request.lastName().trim(),
                request.email().trim(),
                request.phone().trim(),
                request.address().trim(),
                "PENDING_APPROVAL",
                OffsetDateTime.now()
        );
        customer.setDateOfBirth(request.dateOfBirth());
        customer.setGender(request.gender());
        customer.setIdType(request.idType());
        customer.setIdNumber(request.idNumber());
        customer.setOccupation(request.occupation());
        customer.setAnnualIncome(request.annualIncome());
        customer.setEmergencyContactName(request.emergencyContactName());
        customer.setEmergencyContactPhone(request.emergencyContactPhone());
        customerRepository.save(customer);

        // 2. Create user account (no password stored locally; Keycloak owns credentials)
        UUID userId = UUID.randomUUID();
        User user = new User(
                userId,
                request.username().trim(),
                request.email().trim(),
                request.firstName().trim() + " " + request.lastName().trim(),
                "CUSTOMER",
                customerId,
                "PENDING_APPROVAL",
                OffsetDateTime.now()
        );
        userRepository.save(user);

        // 3. Store real user in Keycloak database and assign CUSTOMER role
        keycloakService.createUserInKeycloak(
                user.getUsername(),
                user.getEmail(),
                user.getFullName(),
                request.password(),
                "CUSTOMER"
        );

        // 4. Authenticate against Keycloak to obtain real JWT Access Token
        KeycloakTokenResponse keycloakToken = keycloakService.authenticate(user.getUsername(), request.password());
        if (keycloakToken == null || keycloakToken.accessToken() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unable to issue access token for the new customer");
        }
        String token = keycloakToken.accessToken();

        return new LoginResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFullName(),
                user.getRole(),
                user.getCustomerId(),
                token,
                "/portal",
                "PENDING_APPROVAL"
        );
    }

    @Transactional
    public UserDto createUserByAdmin(AdminCreateUserRequest request) {
        if (userRepository.existsByUsername(request.username().trim())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username is already taken");
        }
        if (userRepository.existsByEmail(request.email().trim())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email is already registered");
        }

        UUID customerId = null;
        if ("CUSTOMER".equalsIgnoreCase(request.role().trim())) {
            // Check if customer already exists by email or create new one
            Customer customer = customerRepository.searchCustomers(request.email().trim(), org.springframework.data.domain.Pageable.unpaged())
                    .stream().findFirst().orElse(null);

            if (customer == null) {
                String customerNumber = String.format("CUST-2026-%03d", customerRepository.nextCustomerNumber());
                String[] names = request.fullName().trim().split("\\s+", 2);
                String firstName = names[0];
                String lastName = names.length > 1 ? names[1] : "Customer";

                customer = new Customer(
                        UUID.randomUUID(),
                        customerNumber,
                        firstName,
                        lastName,
                        request.email().trim(),
                        request.phone() != null ? request.phone() : "+1 (555) 000-0000",
                        request.address() != null ? request.address() : "Standard Address",
                        "ACTIVE",
                        OffsetDateTime.now()
                );
                customer = customerRepository.save(customer);
            }
            customerId = customer.getId();
        }

        User user = new User(
                UUID.randomUUID(),
                request.username().trim(),
                request.email().trim(),
                request.fullName().trim(),
                request.role().trim().toUpperCase(),
                customerId,
                "ACTIVE",
                OffsetDateTime.now()
        );
        User saved = userRepository.save(user);

        // Store real user in Keycloak database and assign designated role
        keycloakService.createUserInKeycloak(
                user.getUsername(),
                user.getEmail(),
                user.getFullName(),
                request.password(),
                user.getRole()
        );

        return new UserDto(
                saved.getId(),
                saved.getUsername(),
                saved.getEmail(),
                saved.getFullName(),
                saved.getRole(),
                saved.getCustomerId(),
                saved.getStatus(),
                saved.getCreatedAt()
        );
    }

    @Transactional(readOnly = true)
    public List<UserDto> listUsers() {
        return userRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(u -> new UserDto(
                        u.getId(),
                        u.getUsername(),
                        u.getEmail(),
                        u.getFullName(),
                        u.getRole(),
                        u.getCustomerId(),
                        u.getStatus(),
                        u.getCreatedAt()
                ))
                .toList();
    }

    /**
     * On application startup, ensure all existing database users are synchronized into Keycloak.
     */
    @EventListener(ApplicationReadyEvent.class)
    public void syncUsersToKeycloakOnStartup() {
        Thread syncThread = new Thread(() -> {
            try {
                // Wait briefly for Keycloak container readiness if services started together
                Thread.sleep(4000);
                List<User> users = userRepository.findAll();
                log.info("Starting background synchronization of {} users to Keycloak", users.size());
                for (User user : users) {
                    try {
                        keycloakService.createUserInKeycloak(
                                user.getUsername(),
                                user.getEmail(),
                                user.getFullName(),
                                null,
                                user.getRole(),
                                false
                        );
                    } catch (Exception ex) {
                        log.warn("Could not sync user '{}' to Keycloak: {}", user.getUsername(), ex.getMessage());
                    }
                }
                log.info("Completed startup synchronization of real users to Keycloak");
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            } catch (Exception e) {
                log.warn("Background Keycloak startup sync encountered error: {}", e.getMessage());
            }
        }, "keycloak-sync-worker");
        syncThread.setDaemon(true);
        syncThread.start();
    }

    public static String getRedirectUrlForRole(String role) {
        if (role == null) return "/dashboard";
        return switch (role.toUpperCase()) {
            case "ADMIN" -> "/dashboard";
            case "UNDERWRITER" -> "/policies";
            case "CLAIMS_OFFICER" -> "/claims";
            case "FINANCE_OFFICER" -> "/payments";
            case "CUSTOMER_SERVICE" -> "/customers";
            case "CUSTOMER" -> "/portal";
            default -> "/dashboard";
        };
    }

    @Transactional
    public ForgotPasswordResponse forgotPassword(ForgotPasswordRequest request) {
        String identifier = request.usernameOrEmail().trim();
        User user = userRepository.findByUsernameIgnoreCase(identifier)
                .or(() -> userRepository.findByEmailIgnoreCase(identifier))
                .orElseGet(() -> {
                    // Check if a registered customer exists with this email address
                    Customer customer = customerRepository.findByEmailIgnoreCase(identifier).orElse(null);
                    if (customer != null) {
                        User newUser = new User(
                                UUID.randomUUID(),
                                customer.getEmail().toLowerCase(),
                                customer.getEmail(),
                                (customer.getFirstName() + " " + customer.getLastName()).trim(),
                                "CUSTOMER",
                                customer.getId(),
                                customer.getStatus() != null ? customer.getStatus() : "ACTIVE",
                                OffsetDateTime.now()
                        );
                        return userRepository.save(newUser);
                    }
                    // If the customer entered any email address, automatically create customer account
                    // so the 6-digit verification code is immediately dispatched to their entered email!
                    if (identifier.contains("@") && identifier.contains(".")) {
                        String cleanEmail = identifier.toLowerCase().trim();
                        String baseUsername = cleanEmail.substring(0, cleanEmail.indexOf('@')).replaceAll("[^a-zA-Z0-9_]", "");
                        if (baseUsername.isBlank()) {
                            baseUsername = "customer";
                        }
                        String candidateUsername = baseUsername;
                        int suffix = 1;
                        while (userRepository.existsByUsernameIgnoreCase(candidateUsername)) {
                            candidateUsername = baseUsername + "_" + suffix++;
                        }

                        String defaultName = baseUsername;
                        if (defaultName.length() > 1) {
                            defaultName = Character.toUpperCase(defaultName.charAt(0)) + defaultName.substring(1);
                        }

                        User newUser = new User(
                                UUID.randomUUID(),
                                candidateUsername,
                                cleanEmail,
                                defaultName,
                                "CUSTOMER",
                                null,
                                "ACTIVE",
                                OffsetDateTime.now()
                        );
                        return userRepository.save(newUser);
                    }

                    throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No account found matching username or email: " + identifier);
                });

        // Generate 6-digit verification code
        String resetCode = String.format("%06d", (int) (Math.random() * 900000) + 100000);
        OffsetDateTime expiry = OffsetDateTime.now().plusMinutes(15);

        PasswordResetToken resetToken = new PasswordResetToken(
                UUID.randomUUID(),
                user,
                resetCode,
                expiry,
                OffsetDateTime.now()
        );
        tokenRepository.save(resetToken);

        emailService.sendPasswordResetEmail(user.getEmail(), user.getFullName(), resetCode);

        String masked = maskEmail(user.getEmail());
        return new ForgotPasswordResponse(
                "A 6-digit verification code has been dispatched to your registered email address (" + masked + "). Please check your inbox.",
                masked
        );
    }

    @Transactional
    public Map<String, String> resetPassword(ResetPasswordRequest request) {
        String tokenVal = request.token().trim();
        PasswordResetToken resetToken = tokenRepository.findByToken(tokenVal)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid verification code. Please check your email or request a new code."));

        if (resetToken.isUsed()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This verification code has already been used. Please request a new one.");
        }

        if (resetToken.getExpiryDate().isBefore(OffsetDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This verification code has expired. Verification codes are valid for 15 minutes.");
        }

        User user = resetToken.getUser();

        // 1. Reset password in Keycloak
        boolean success = keycloakService.resetPassword(user.getUsername(), user.getEmail(), user.getFullName(), user.getRole(), request.newPassword());
        if (!success) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to update credentials in Keycloak identity provider.");
        }

        // 2. Invalidate reset token
        resetToken.setUsed(true);
        tokenRepository.save(resetToken);

        // 3. Unlock account immediately and reset failed attempts counter
        user.setFailedLoginAttempts(0);
        user.setLockedUntil(null);
        user.setUpdatedAt(OffsetDateTime.now());
        userRepository.save(user);

        log.info("Password successfully reset for user '{}', account unlocked and restored to active state", user.getUsername());

        return Map.of("message", "Password has been successfully updated! Your account is unlocked and you may now sign in.");
    }

    private String maskEmail(String email) {
        if (email == null || !email.contains("@")) return email;
        int atIndex = email.indexOf('@');
        String name = email.substring(0, atIndex);
        String domain = email.substring(atIndex);
        if (name.length() <= 2) {
            return name.charAt(0) + "***" + domain;
        }
        return name.charAt(0) + "***" + name.charAt(name.length() - 1) + domain;
    }
}
