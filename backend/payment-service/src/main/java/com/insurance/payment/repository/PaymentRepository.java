package com.insurance.payment.repository;

import com.insurance.payment.model.Payment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, UUID> {
    Optional<Payment> findByPaymentReference(String paymentReference);
    Optional<Payment> findByIdempotencyKey(String idempotencyKey);
    List<Payment> findByPolicyId(UUID policyId);
    Page<Payment> findByStatus(String status, Pageable pageable);

    @Query(value = "SELECT nextval('payment_reference_seq')", nativeQuery = true)
    long nextPaymentReference();

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p")
    java.math.BigDecimal sumPaymentsAmount();
}
