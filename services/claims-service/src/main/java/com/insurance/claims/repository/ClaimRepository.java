package com.insurance.claims.repository;

import com.insurance.claims.model.Claim;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ClaimRepository extends JpaRepository<Claim, UUID> {
    Optional<Claim> findByClaimNumber(String claimNumber);
    Page<Claim> findByStatus(String status, Pageable pageable);
}
