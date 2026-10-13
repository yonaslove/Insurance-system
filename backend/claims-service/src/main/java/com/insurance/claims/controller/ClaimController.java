package com.insurance.claims.controller;

import com.insurance.claims.dto.ClaimCreateRequest;
import com.insurance.claims.dto.ClaimDecisionRequest;
import com.insurance.claims.dto.ClaimDto;
import com.insurance.claims.service.ClaimService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/claims")
@Tag(name = "Claims Adjudication", description = "Endpoints for loss notification, adjuster review, and claim decisions")
public class ClaimController {

    private final ClaimService claimService;

    public ClaimController(ClaimService claimService) {
        this.claimService = claimService;
    }

    @GetMapping
    @Operation(summary = "List claims with pagination and status filters")
    public ResponseEntity<Page<ClaimDto>> listClaims(
            @RequestParam(required = false) String status,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(claimService.listClaims(status, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Retrieve claim details by ID")
    public ResponseEntity<ClaimDto> getClaim(@PathVariable UUID id) {
        return ResponseEntity.ok(claimService.getClaimById(id));
    }

    @PostMapping
    @Operation(summary = "Submit new loss claim against a policy")
    public ResponseEntity<ClaimDto> createClaim(@Valid @RequestBody ClaimCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(claimService.createClaim(request));
    }

    @PostMapping("/{id}/decision")
    @Operation(summary = "Record adjuster approval or rejection decision")
    public ResponseEntity<ClaimDto> decideClaim(
            @PathVariable UUID id,
            @Valid @RequestBody ClaimDecisionRequest request) {
        return ResponseEntity.ok(claimService.processDecision(id, request));
    }
}
