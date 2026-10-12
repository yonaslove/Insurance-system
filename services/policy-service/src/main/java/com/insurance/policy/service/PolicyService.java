package com.insurance.policy.service;

import com.insurance.policy.dto.PolicyCreateRequest;
import com.insurance.policy.dto.PolicyDto;
import com.insurance.policy.model.Policy;
import com.insurance.policy.repository.PolicyRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.UUID;

@Service
public class PolicyService {

    private final PolicyRepository policyRepository;

    public PolicyService(PolicyRepository policyRepository) {
        this.policyRepository = policyRepository;
    }

    @Transactional(readOnly = true)
    public Page<PolicyDto> listPolicies(String status, Pageable pageable) {
        Page<Policy> page;
        if (status != null && !status.isBlank()) {
            page = policyRepository.findByStatus(status.toUpperCase().trim(), pageable);
        } else {
            page = policyRepository.findAll(pageable);
        }
        return page.map(this::toDto);
    }

    @Transactional(readOnly = true)
    public PolicyDto getPolicyById(UUID id) {
        return policyRepository.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Policy not found"));
    }

    @Transactional
    public PolicyDto createPolicy(PolicyCreateRequest request) {
        if (request.endDate().isBefore(request.startDate())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Policy end date cannot be prior to start date");
        }

        long count = policyRepository.count();
        String policyNumber = String.format("POL-2026-%04d", 8800 + count + 1);

        Policy policy = new Policy(
                UUID.randomUUID(),
                policyNumber,
                request.customerId(),
                request.productId(),
                request.startDate(),
                request.endDate(),
                request.premiumAmount(),
                request.currency(),
                "ACTIVE",
                OffsetDateTime.now()
        );

        return toDto(policyRepository.save(policy));
    }

    private PolicyDto toDto(Policy p) {
        return new PolicyDto(
                p.getId(),
                p.getPolicyNumber(),
                p.getCustomerId(),
                p.getProductId(),
                p.getStartDate(),
                p.getEndDate(),
                p.getPremiumAmount(),
                p.getCurrency(),
                p.getStatus(),
                p.getCreatedAt()
        );
    }
}
