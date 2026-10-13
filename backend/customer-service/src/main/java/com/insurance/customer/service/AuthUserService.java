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

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class AuthUserService {

    private static final Logger log = LoggerFactory.getLogger(AuthUserService.class);

    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final KeycloakService keycloakService;

    public AuthUserService(UserRepository userRepository,
                           CustomerRepository customerRepository,
                           KeycloakService keycloakService) {
        this.userRepository = userRepository;
        this.customerRepository = customerRepository;
        this.keycloakService = keycloakService;
    }

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        String identifier = request.usernameOrEmail().trim();
        User user = userRepository.findByUsername(identifier)
                .or(() -> userRepository.findByEmail(identifier))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid username/email or password"));

        if (!user.getPassword().equals(request.password())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid username/email or password");
        }

        if ("REJECTED".equalsIgnoreCase(user.getStatus())) {
            String reason = user.getRejectionReason() != null ? user.getRejectionReason() : "Failed KYC identity verification criteria";
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Registration application rejected: " + reason);
        }

        if (!"ACTIVE".equalsIgnoreCase(user.getStatus()) && !"PENDING_APPROVAL".equalsIgnoreCase(user.getStatus())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User account is suspended or inactive");
        }

        String redirectUrl = getRedirectUrlForRole(user.getRole());

        // Authenticate directly with Keycloak and obtain real, cryptographically signed Keycloak JWT Access Token
        KeycloakTokenResponse keycloakToken = keycloakService.authenticate(user.getUsername(), request.password());
        String token = (keycloakToken != null && keycloakToken.accessToken() != null)
                ? keycloakToken.accessToken()
                : keycloakService.generateFallbackJwtToken(user.getUsername(), user.getRole()).accessToken();

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
        long customerCount = customerRepository.count();
        String customerNumber = String.format("CUST-2026-%03d", customerCount + 1);
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

        // 2. Create user credentials with PENDING_APPROVAL status
        UUID userId = UUID.randomUUID();
        User user = new User(
                userId,
                request.username().trim(),
                request.password(),
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
        String token = (keycloakToken != null && keycloakToken.accessToken() != null)
                ? keycloakToken.accessToken()
                : keycloakService.generateFallbackJwtToken(user.getUsername(), "CUSTOMER").accessToken();

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
                long customerCount = customerRepository.count();
                String customerNumber = String.format("CUST-2026-%03d", customerCount + 1);
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
                request.password(),
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
                                user.getPassword(),
                                user.getRole()
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
}
