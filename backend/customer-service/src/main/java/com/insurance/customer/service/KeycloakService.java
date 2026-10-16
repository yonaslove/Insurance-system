package com.insurance.customer.service;

import com.insurance.customer.dto.KeycloakTokenResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.*;

@Service
public class KeycloakService {

    private static final Logger log = LoggerFactory.getLogger(KeycloakService.class);

    private final RestTemplate restTemplate;

    @Value("${keycloak.auth-server-url:http://localhost:8180}")
    private String authServerUrl;

    @Value("${keycloak.realm:insurance}")
    private String realm;

    @Value("${keycloak.client-id:insurance-web}")
    private String clientId;

    @Value("${keycloak.admin-username:admin}")
    private String adminUsername;

    @Value("${keycloak.admin-password:admin}")
    private String adminPassword;

    private String cachedAdminToken = null;
    private Instant adminTokenExpiry = Instant.MIN;

    public KeycloakService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * Authenticate user credentials directly against Keycloak token endpoint.
     * Returns the real, cryptographically signed Keycloak JWT Access Token.
     */
    public KeycloakTokenResponse authenticate(String usernameOrEmail, String password) {
        String tokenUrl = String.format("%s/realms/%s/protocol/openid-connect/token", authServerUrl, realm);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("grant_type", "password");
        form.add("client_id", clientId);
        form.add("username", usernameOrEmail);
        form.add("password", password);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(form, headers);

        try {
            log.info("Authenticating user '{}' against Keycloak at {}", usernameOrEmail, tokenUrl);
            ResponseEntity<KeycloakTokenResponse> response = restTemplate.postForEntity(
                    tokenUrl,
                    request,
                    KeycloakTokenResponse.class
            );
            log.info("Successfully authenticated '{}' with Keycloak, token issued", usernameOrEmail);
            return response.getBody();
        } catch (HttpStatusCodeException ex) {
            log.warn("Keycloak authentication failed for user '{}': status={}, body={}",
                    usernameOrEmail, ex.getStatusCode(), ex.getResponseBodyAsString());
            if (ex.getStatusCode() == HttpStatus.UNAUTHORIZED || ex.getStatusCode() == HttpStatus.BAD_REQUEST) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid username/email or password");
            }
            throw new ResponseStatusException(ex.getStatusCode(), "Authentication provider error: " + ex.getStatusText());
        } catch (ResourceAccessException ex) {
            log.error("Keycloak server at {} is unreachable: {}", authServerUrl, ex.getMessage());
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Identity provider is temporarily unavailable. Please try again shortly.");
        }
    }

    /**
     * Creates (or re-synchronizes) a user inside Keycloak and assigns the designated realm role,
     * resetting the password of an already-existing Keycloak user to the supplied value.
     */
    public String createUserInKeycloak(String username, String email, String fullName, String password, String role) {
        return createUserInKeycloak(username, email, fullName, password, role, true);
    }

    /**
     * Creates (or re-synchronizes) a user inside Keycloak and assigns the designated realm role.
     *
     * @param resetExistingPassword when true, an existing Keycloak user has their password reset to the
     *                              supplied value; when false an existing user is left untouched (used by
     *                              startup reconciliation so live credentials are never overwritten).
     */
    public String createUserInKeycloak(String username, String email, String fullName, String password, String role, boolean resetExistingPassword) {
        String adminToken = getAdminAccessToken();
        if (adminToken == null) {
            log.warn("Cannot create user in Keycloak because Admin API is unreachable. Skipping remote Keycloak sync.");
            return null;
        }

        String[] nameParts = splitFullName(fullName);
        String firstName = nameParts[0];
        String lastName = nameParts[1];

        String usersUrl = String.format("%s/admin/realms/%s/users", authServerUrl, realm);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(adminToken);

        Map<String, Object> userPayload = new HashMap<>();
        userPayload.put("username", username);
        userPayload.put("email", email);
        userPayload.put("firstName", firstName);
        userPayload.put("lastName", lastName);
        userPayload.put("enabled", true);
        userPayload.put("emailVerified", true);
        if (password != null && !password.isBlank()) {
            userPayload.put("credentials", List.of(Map.of(
                    "type", "password",
                    "value", password,
                    "temporary", false
            )));
        }

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(userPayload, headers);

        String userId = null;
        try {
            log.info("Creating user '{}' ({}) in Keycloak realm '{}'", username, email, realm);
            ResponseEntity<String> response = restTemplate.postForEntity(usersUrl, request, String.class);

            if (response.getStatusCode() == HttpStatus.CREATED) {
                String location = response.getHeaders().getFirst("Location");
                if (location != null) {
                    userId = location.substring(location.lastIndexOf('/') + 1);
                }
            }
        } catch (HttpStatusCodeException ex) {
            if (ex.getStatusCode() == HttpStatus.CONFLICT) {
                log.info("User '{}' already exists in Keycloak realm. Resolving existing Keycloak user ID.", username);
                userId = findUserIdByUsername(username, adminToken);
                if (userId != null && resetExistingPassword && password != null && !password.isBlank()) {
                    resetKeycloakUserPassword(userId, password, adminToken);
                }
            } else {
                log.error("Failed to create user '{}' in Keycloak: status={}, body={}",
                        username, ex.getStatusCode(), ex.getResponseBodyAsString());
                return null;
            }
        } catch (Exception ex) {
            log.error("Exception while creating user '{}' in Keycloak: {}", username, ex.getMessage());
            return null;
        }

        if (userId == null) {
            userId = findUserIdByUsername(username, adminToken);
        }

        if (userId != null && role != null && !role.isBlank()) {
            assignRealmRoleToUser(userId, role, adminToken);
        }

        log.info("User '{}' successfully synchronized to Keycloak with ID: {}", username, userId);
        return userId;
    }

    /**
     * Assigns a realm role to an existing Keycloak user ID.
     */
    public void assignRealmRoleToUser(String userId, String roleName, String adminToken) {
        try {
            String roleUrl = String.format("%s/admin/realms/%s/roles/%s", authServerUrl, realm, roleName.toUpperCase());
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(adminToken);
            HttpEntity<Void> roleReq = new HttpEntity<>(headers);

            ResponseEntity<Map<String, Object>> roleResp = restTemplate.exchange(
                    roleUrl,
                    HttpMethod.GET,
                    roleReq,
                    new ParameterizedTypeReference<Map<String, Object>>() {}
            );

            if (roleResp.getStatusCode() == HttpStatus.OK && roleResp.getBody() != null) {
                Map<String, Object> roleObj = roleResp.getBody();
                String roleMappingUrl = String.format("%s/admin/realms/%s/users/%s/role-mappings/realm", authServerUrl, realm, userId);
                headers.setContentType(MediaType.APPLICATION_JSON);
                HttpEntity<List<Map<String, Object>>> mappingReq = new HttpEntity<>(List.of(roleObj), headers);

                restTemplate.postForEntity(roleMappingUrl, mappingReq, String.class);
                log.info("Assigned role '{}' to Keycloak user ID {}", roleName, userId);
            }
        } catch (Exception ex) {
            log.warn("Could not map role '{}' to Keycloak user ID {}: {}", roleName, userId, ex.getMessage());
        }
    }

    /**
     * Public method to reset a user's password in Keycloak.
     * If user is not present in Keycloak, provisions them with the new password.
     */
    public boolean resetPassword(String username, String email, String fullName, String role, String newPassword) {
        String adminToken = getAdminAccessToken();
        if (adminToken == null) {
            log.error("Cannot reset password: Keycloak Admin API token could not be obtained");
            return false;
        }

        String userId = findUserIdByUsername(username, adminToken);
        if (userId == null) {
            log.info("User '{}' not found in Keycloak during reset. Provisioning user into Keycloak.", username);
            userId = createUserInKeycloak(username, email, fullName, newPassword, role, true);
            return userId != null;
        }

        resetKeycloakUserPassword(userId, newPassword, adminToken);
        return true;
    }

    /**
     * Updates an existing user's profile and role in Keycloak.
     */
    public void updateKeycloakUser(String username, String email, String fullName, String role) {
        String adminToken = getAdminAccessToken();
        if (adminToken == null) return;

        String userId = findUserIdByUsername(username, adminToken);
        if (userId == null) {
            log.info("User '{}' not found in Keycloak during update", username);
            return;
        }

        try {
            String userUrl = String.format("%s/admin/realms/%s/users/%s", authServerUrl, realm, userId);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(adminToken);

            String[] nameParts = splitFullName(fullName);
            Map<String, Object> updatePayload = new HashMap<>();
            updatePayload.put("email", email);
            updatePayload.put("firstName", nameParts[0]);
            updatePayload.put("lastName", nameParts[1]);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(updatePayload, headers);
            restTemplate.exchange(userUrl, HttpMethod.PUT, request, Void.class);
            log.info("Updated Keycloak attributes for user '{}' (ID {})", username, userId);

            if (role != null && !role.isBlank()) {
                assignRealmRoleToUser(userId, role.toUpperCase(), adminToken);
            }
        } catch (Exception ex) {
            log.warn("Could not update Keycloak user '{}': {}", username, ex.getMessage());
        }
    }

    /**
     * Deletes a user account from Keycloak realm.
     */
    public void deleteUserInKeycloak(String username) {
        String adminToken = getAdminAccessToken();
        if (adminToken == null) return;

        String userId = findUserIdByUsername(username, adminToken);
        if (userId != null) {
            try {
                String deleteUrl = String.format("%s/admin/realms/%s/users/%s", authServerUrl, realm, userId);
                HttpHeaders headers = new HttpHeaders();
                headers.setBearerAuth(adminToken);
                restTemplate.exchange(deleteUrl, HttpMethod.DELETE, new HttpEntity<>(headers), Void.class);
                log.info("Deleted Keycloak user ID {} ('{}')", userId, username);
            } catch (Exception ex) {
                log.warn("Could not delete user '{}' in Keycloak: {}", username, ex.getMessage());
            }
        }
    }

    /**
     * Resets a user's password in Keycloak.
     */
    public void resetKeycloakUserPassword(String userId, String newPassword, String adminToken) {
        try {
            String resetUrl = String.format("%s/admin/realms/%s/users/%s/reset-password", authServerUrl, realm, userId);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(adminToken);

            Map<String, Object> credentialMap = Map.of(
                    "type", "password",
                    "value", newPassword,
                    "temporary", false
            );

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(credentialMap, headers);
            restTemplate.exchange(resetUrl, HttpMethod.PUT, request, Void.class);
            log.info("Reset password for Keycloak user ID {}", userId);
        } catch (Exception ex) {
            log.warn("Could not reset password for Keycloak user ID {}: {}", userId, ex.getMessage());
        }
    }

    /**
     * Looks up user ID in Keycloak by username.
     */
    public String findUserIdByUsername(String username, String adminToken) {
        try {
            String queryUrl = String.format("%s/admin/realms/%s/users?username=%s&exact=true", authServerUrl, realm, username);
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(adminToken);
            HttpEntity<Void> request = new HttpEntity<>(headers);

            ResponseEntity<List<Map<String, Object>>> response = restTemplate.exchange(
                    queryUrl,
                    HttpMethod.GET,
                    request,
                    new ParameterizedTypeReference<List<Map<String, Object>>>() {}
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null && !response.getBody().isEmpty()) {
                return (String) response.getBody().get(0).get("id");
            }
        } catch (Exception ex) {
            log.warn("Error looking up Keycloak user by username '{}': {}", username, ex.getMessage());
        }
        return null;
    }

    /**
     * Obtains and caches a master realm admin token for Keycloak Administration REST APIs.
     */
    private synchronized String getAdminAccessToken() {
        if (cachedAdminToken != null && Instant.now().isBefore(adminTokenExpiry)) {
            return cachedAdminToken;
        }

        String adminTokenUrl = String.format("%s/realms/master/protocol/openid-connect/token", authServerUrl);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("grant_type", "password");
        form.add("client_id", "admin-cli");
        form.add("username", adminUsername);
        form.add("password", adminPassword);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(form, headers);

        try {
            ResponseEntity<KeycloakTokenResponse> response = restTemplate.postForEntity(
                    adminTokenUrl,
                    request,
                    KeycloakTokenResponse.class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                KeycloakTokenResponse body = response.getBody();
                cachedAdminToken = body.accessToken();
                long lifetime = body.expiresIn() != null ? body.expiresIn() : 60L;
                adminTokenExpiry = Instant.now().plusSeconds(Math.max(10, lifetime - 10));
                return cachedAdminToken;
            }
        } catch (Exception ex) {
            log.warn("Unable to obtain Keycloak admin token from {}: {}", adminTokenUrl, ex.getMessage());
        }
        return null;
    }

    private String[] splitFullName(String fullName) {
        if (fullName == null || fullName.isBlank()) {
            return new String[]{"User", "Account"};
        }
        String[] parts = fullName.trim().split("\\s+", 2);
        String first = parts[0];
        String last = parts.length > 1 ? parts[1] : first;
        return new String[]{first, last};
    }
}
