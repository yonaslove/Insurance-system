package com.insurance.payment.service;

import com.insurance.payment.client.PolicyClient;
import com.insurance.payment.dto.PaymentCreateRequest;
import com.insurance.payment.dto.PaymentDto;
import com.insurance.payment.model.Payment;
import com.insurance.payment.repository.PaymentRepository;
import feign.FeignException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final PolicyClient policyClient;

    public PaymentService(PaymentRepository paymentRepository, PolicyClient policyClient) {
        this.paymentRepository = paymentRepository;
        this.policyClient = policyClient;
    }

    @Transactional(readOnly = true)
    public Page<PaymentDto> listPayments(String status, Pageable pageable) {
        Page<Payment> page;
        if (status != null && !status.isBlank()) {
            page = paymentRepository.findByStatus(status.toUpperCase().trim(), pageable);
        } else {
            page = paymentRepository.findAll(pageable);
        }
        return page.map(this::toDto);
    }

    @Transactional(readOnly = true)
    public PaymentDto getPaymentById(UUID id) {
        return paymentRepository.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Payment not found"));
    }

    @Transactional(readOnly = true)
    public BigDecimal getTotalAmount() {
        BigDecimal total = paymentRepository.sumPaymentsAmount();
        return total != null ? total : BigDecimal.ZERO;
    }

    @Transactional
    public PaymentDto recordPayment(PaymentCreateRequest request) {
        assertPolicyExists(request.policyId());

        String idempotencyKey = request.idempotencyKey() != null ? request.idempotencyKey().trim() : null;

        // Idempotent replay: return the previously recorded payment for the same client-supplied key.
        if (idempotencyKey != null && !idempotencyKey.isBlank()) {
            Optional<Payment> existing = paymentRepository.findByIdempotencyKey(idempotencyKey);
            if (existing.isPresent()) {
                return toDto(existing.get());
            }
        }

        String paymentRef = String.format("PAY-REF-%04d", paymentRepository.nextPaymentReference());

        Payment payment = new Payment(
                UUID.randomUUID(),
                paymentRef,
                request.policyId(),
                request.claimId(),
                request.amount(),
                request.currency(),
                request.paymentMethodReference(),
                "COMPLETED",
                OffsetDateTime.now(),
                OffsetDateTime.now()
        );
        payment.setIdempotencyKey(idempotencyKey != null && !idempotencyKey.isBlank() ? idempotencyKey : null);

        return toDto(paymentRepository.save(payment));
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

    private PaymentDto toDto(Payment p) {
        return new PaymentDto(
                p.getId(),
                p.getPaymentReference(),
                p.getPolicyId(),
                p.getClaimId(),
                p.getAmount(),
                p.getCurrency(),
                p.getPaymentMethodReference(),
                p.getStatus(),
                p.getPaidAt(),
                p.getCreatedAt(),
                p.getIdempotencyKey()
        );
    }
}
