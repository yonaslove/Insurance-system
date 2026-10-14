package com.insurance.policy.service;

import com.insurance.policy.client.CustomerClient;
import com.insurance.policy.client.ProductClient;
import com.insurance.policy.dto.PolicyCreateRequest;
import com.insurance.policy.dto.PolicyDto;
import com.insurance.policy.model.Policy;
import com.insurance.policy.repository.PolicyRepository;
import feign.FeignException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.Set;
import java.util.UUID;

@Service
public class PolicyService {

    private static final Set<String> VALID_STATUSES =
            Set.of("ACTIVE", "LAPSED", "CANCELLED", "EXPIRED", "SUSPENDED");

    private final PolicyRepository policyRepository;
    private final CustomerClient customerClient;
    private final ProductClient productClient;

    public PolicyService(PolicyRepository policyRepository,
                         CustomerClient customerClient,
                         ProductClient productClient) {
        this.policyRepository = policyRepository;
        this.customerClient = customerClient;
        this.productClient = productClient;
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

        assertCustomerExists(request.customerId());
        assertProductExists(request.productId());

        String policyNumber = String.format("POL-2026-%04d", policyRepository.nextPolicyNumber());

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

    @Transactional
    public PolicyDto renewPolicy(UUID id) {
        Policy policy = policyRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Policy not found"));

        if ("CANCELLED".equalsIgnoreCase(policy.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cancelled policies cannot be renewed");
        }

        policy.setEndDate(policy.getEndDate().plusYears(1));
        policy.setStatus("ACTIVE");
        return toDto(policyRepository.save(policy));
    }

    @Transactional
    public PolicyDto updateStatus(UUID id, String status) {
        if (status == null || !VALID_STATUSES.contains(status.toUpperCase().trim())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported policy status: " + status);
        }

        Policy policy = policyRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Policy not found"));

        policy.setStatus(status.toUpperCase().trim());
        return toDto(policyRepository.save(policy));
    }

    private void assertCustomerExists(UUID customerId) {
        try {
            customerClient.getCustomer(customerId);
        } catch (FeignException.NotFound ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown customer: " + customerId);
        } catch (FeignException ex) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Customer service is currently unavailable");
        }
    }

    private void assertProductExists(UUID productId) {
        try {
            productClient.getProduct(productId);
        } catch (FeignException.NotFound ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown product: " + productId);
        } catch (FeignException ex) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Product service is currently unavailable");
        }
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
