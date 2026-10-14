package com.insurance.payment.controller;

import com.insurance.payment.dto.PaymentCreateRequest;
import com.insurance.payment.dto.PaymentDto;
import com.insurance.payment.service.PaymentService;
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
@RequestMapping("/api/v1/payments")
@Tag(name = "Payment Recording", description = "Endpoints for premium payment reconciliation and ledger search")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @GetMapping
    @Operation(summary = "List and search payments with pagination")
    public ResponseEntity<Page<PaymentDto>> listPayments(
            @RequestParam(required = false) String status,
            @PageableDefault(size = 20, sort = "paidAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(paymentService.listPayments(status, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Retrieve payment receipt by ID")
    public ResponseEntity<PaymentDto> getPayment(@PathVariable UUID id) {
        return ResponseEntity.ok(paymentService.getPaymentById(id));
    }

    @GetMapping("/summary")
    @Operation(summary = "Aggregate collected payment totals for the dashboard")
    public ResponseEntity<Map<String, Object>> summary() {
        return ResponseEntity.ok(Map.of(
                "totalAmount", paymentService.getTotalAmount(),
                "currency", "USD"
        ));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_OFFICER')")
    @Operation(summary = "Record a new verified payment receipt")
    public ResponseEntity<PaymentDto> recordPayment(@Valid @RequestBody PaymentCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(paymentService.recordPayment(request));
    }
}
