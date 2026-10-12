package com.insurance.customer.controller;

import com.insurance.customer.dto.CustomerCreateRequest;
import com.insurance.customer.dto.CustomerDto;
import com.insurance.customer.service.CustomerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/customers")
@Tag(name = "Customer Management", description = "Endpoints for customer registration, search, and lifecycle")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @GetMapping
    @Operation(summary = "List and search customers with pagination")
    public ResponseEntity<Page<CustomerDto>> listCustomers(
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(customerService.listCustomers(search, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Retrieve customer profile by ID")
    public ResponseEntity<CustomerDto> getCustomer(@PathVariable UUID id) {
        return ResponseEntity.ok(customerService.getCustomerById(id));
    }

    @PostMapping
    @Operation(summary = "Register a new customer")
    public ResponseEntity<CustomerDto> createCustomer(@Valid @RequestBody CustomerCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(customerService.createCustomer(request));
    }

    @PostMapping("/{id}/approve")
    @Operation(summary = "Customer Service / Admin: Approve customer KYC registration and activate policyholder")
    public ResponseEntity<CustomerDto> approveCustomer(@PathVariable UUID id) {
        return ResponseEntity.ok(customerService.approveCustomer(id));
    }

    @PostMapping("/{id}/reject")
    @Operation(summary = "Customer Service / Admin: Reject customer KYC application")
    public ResponseEntity<CustomerDto> rejectCustomer(@PathVariable UUID id, @RequestBody(required = false) Map<String, String> body) {
        String reason = body != null ? body.get("reason") : "Failed verification criteria";
        return ResponseEntity.ok(customerService.rejectCustomer(id, reason));
    }
}
