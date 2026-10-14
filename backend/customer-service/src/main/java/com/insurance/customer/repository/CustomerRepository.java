package com.insurance.customer.repository;

import com.insurance.customer.model.Customer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, UUID> {
    Optional<Customer> findByCustomerNumber(String customerNumber);
    boolean existsByEmail(String email);

    @Query("SELECT c FROM Customer c WHERE " +
           "LOWER(c.firstName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(c.lastName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(c.email) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(c.customerNumber) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<Customer> searchCustomers(@Param("query") String query, Pageable pageable);

    @Query(value = "SELECT nextval('customer_number_seq')", nativeQuery = true)
    long nextCustomerNumber();
}
