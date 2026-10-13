package com.insurance.policy.repository;

import com.insurance.policy.model.Policy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PolicyRepository extends JpaRepository<Policy, UUID> {
    Optional<Policy> findByPolicyNumber(String policyNumber);
    Page<Policy> findByStatus(String status, Pageable pageable);
    List<Policy> findByCustomerId(UUID customerId);
}
