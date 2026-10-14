package com.insurance.policy.controller;

import com.insurance.policy.dto.PolicyCreateRequest;
import com.insurance.policy.dto.PolicyDto;
import com.insurance.policy.service.PolicyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/policies")
@Tag(name = "Policy Management", description = "Endpoints for policy issuance, search, and lifecycle status")
public class PolicyController {

    private final PolicyService policyService;

    public PolicyController(PolicyService policyService) {
        this.policyService = policyService;
    }

    @GetMapping
    @Operation(summary = "List and filter policies with pagination")
    public ResponseEntity<Page<PolicyDto>> listPolicies(
            @RequestParam(required = false) String status,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(policyService.listPolicies(status, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Retrieve policy by ID")
    public ResponseEntity<PolicyDto> getPolicy(@PathVariable UUID id) {
        return ResponseEntity.ok(policyService.getPolicyById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'UNDERWRITER')")
    @Operation(summary = "Issue a new policy")
    public ResponseEntity<PolicyDto> createPolicy(@Valid @RequestBody PolicyCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(policyService.createPolicy(request));
    }

    @PostMapping("/{id}/renew")
    @PreAuthorize("hasAnyRole('ADMIN', 'UNDERWRITER')")
    @Operation(summary = "Renew a policy by extending its coverage term")
    public ResponseEntity<PolicyDto> renewPolicy(@PathVariable UUID id) {
        return ResponseEntity.ok(policyService.renewPolicy(id));
    }

    @PostMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'UNDERWRITER')")
    @Operation(summary = "Transition a policy to a new lifecycle status")
    public ResponseEntity<PolicyDto> updateStatus(@PathVariable UUID id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(policyService.updateStatus(id, body.get("status")));
    }
}
