package com.insurance.claims.service;

import com.insurance.claims.client.PolicyClient;
import com.insurance.claims.dto.ClaimCreateRequest;
import com.insurance.claims.dto.ClaimDecisionRequest;
import com.insurance.claims.dto.ClaimDto;
import com.insurance.claims.model.Claim;
import com.insurance.claims.repository.ClaimRepository;
import feign.FeignException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Service
public class ClaimService {

    private final ClaimRepository claimRepository;
    private final PolicyClient policyClient;

    public ClaimService(ClaimRepository claimRepository, PolicyClient policyClient) {
        this.claimRepository = claimRepository;
        this.policyClient = policyClient;
    }

    @Transactional(readOnly = true)
    public Page<ClaimDto> listClaims(String status, Pageable pageable) {
        Page<Claim> page;
        if (status != null && !status.isBlank()) {
            page = claimRepository.findByStatus(status.toUpperCase().trim(), pageable);
        } else {
            page = claimRepository.findAll(pageable);
        }
        return page.map(this::toDto);
    }

    @Transactional(readOnly = true)
    public ClaimDto getClaimById(UUID id) {
        return claimRepository.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Claim not found"));
    }

    @Transactional
    public ClaimDto createClaim(ClaimCreateRequest request) {
        assertPolicyExists(request.policyId());

        String claimNumber = String.format("CLM-2026-%03d", claimRepository.nextClaimNumber());

        Claim claim = new Claim(
                UUID.randomUUID(),
                claimNumber,
                request.policyId(),
                request.incidentDate(),
                request.description(),
                request.claimedAmount(),
                null,
                "SUBMITTED",
                null,
                OffsetDateTime.now()
        );

        return toDto(claimRepository.save(claim));
    }

    @Transactional
    public ClaimDto processDecision(UUID id, ClaimDecisionRequest request) {
        Claim claim = claimRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Claim not found"));

        if (!"SUBMITTED".equals(claim.getStatus()) && !"UNDER_REVIEW".equals(claim.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Claim has already reached terminal state: " + claim.getStatus());
        }

        BigDecimal approved = "APPROVED".equals(request.decision()) ? request.approvedAmount() : BigDecimal.ZERO;
        if ("APPROVED".equals(request.decision()) && approved != null && approved.compareTo(claim.getClaimedAmount()) > 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Approved settlement cannot exceed claimed damage amount");
        }

        claim.setStatus(request.decision());
        claim.setApprovedAmount(approved);
        claim.setReviewerNotes(request.reviewerNotes());
        claim.setUpdatedAt(OffsetDateTime.now());

        return toDto(claimRepository.save(claim));
    }

    private void assertPolicyExists(UUID policyId) {
        try {
            policyClient.getPolicy(policyId);
        } catch (FeignException.NotFound ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown policy: " + policyId);
        } catch (FeignException ex) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Policy service is currently unavailable");
        }
    }

    private ClaimDto toDto(Claim c) {
        return new ClaimDto(
                c.getId(),
                c.getClaimNumber(),
                c.getPolicyId(),
                c.getIncidentDate(),
                c.getDescription(),
                c.getClaimedAmount(),
                c.getApprovedAmount(),
                c.getStatus(),
                c.getReviewerNotes(),
                c.getCreatedAt(),
                c.getUpdatedAt()
        );
    }
}
