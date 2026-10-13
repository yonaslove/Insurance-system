package com.insurance.payment.service;

import com.insurance.payment.dto.PaymentCreateRequest;
import com.insurance.payment.dto.PaymentDto;
import com.insurance.payment.model.Payment;
import com.insurance.payment.repository.PaymentRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.UUID;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;

    public PaymentService(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
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

    @Transactional
    public PaymentDto recordPayment(PaymentCreateRequest request) {
        long count = paymentRepository.count();
        String paymentRef = String.format("PAY-REF-%04d", 9900 + count + 1);

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

        return toDto(paymentRepository.save(payment));
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
                p.getCreatedAt()
        );
    }
}
