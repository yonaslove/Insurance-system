package com.insurance.customer.service;

import com.insurance.customer.dto.CustomerCreateRequest;
import com.insurance.customer.dto.CustomerDto;
import com.insurance.customer.dto.CustomerUpdateRequest;
import com.insurance.customer.model.Customer;
import com.insurance.customer.repository.CustomerRepository;
import com.insurance.customer.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.UUID;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;

    public CustomerService(CustomerRepository customerRepository, UserRepository userRepository) {
        this.customerRepository = customerRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public Page<CustomerDto> listCustomers(String search, Pageable pageable) {
        Page<Customer> page;
        if (search != null && !search.isBlank()) {
            page = customerRepository.searchCustomers(search.trim(), pageable);
        } else {
            page = customerRepository.findAll(pageable);
        }
        return page.map(this::toDto);
    }

    @Transactional(readOnly = true)
    public CustomerDto getCustomerById(UUID id) {
        return customerRepository.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found"));
    }

    @Transactional
    public CustomerDto createCustomer(CustomerCreateRequest request) {
        if (customerRepository.existsByEmail(request.email())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "A customer with this email already exists");
        }

        String customerNumber = String.format("CUST-2026-%03d", customerRepository.nextCustomerNumber());

        Customer customer = new Customer(
                UUID.randomUUID(),
                customerNumber,
                request.firstName(),
                request.lastName(),
                request.email(),
                request.phone(),
                request.address(),
                "ACTIVE",
                OffsetDateTime.now()
        );
        customer.setDateOfBirth(request.dateOfBirth());
        customer.setGender(request.gender());
        customer.setIdType(request.idType());
        customer.setIdNumber(request.idNumber());
        customer.setOccupation(request.occupation());
        customer.setAnnualIncome(request.annualIncome());
        customer.setEmergencyContactName(request.emergencyContactName());
        customer.setEmergencyContactPhone(request.emergencyContactPhone());

        return toDto(customerRepository.save(customer));
    }

    @Transactional
    public CustomerDto approveCustomer(UUID id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found"));
        customer.setStatus("ACTIVE");
        customer.setRejectionReason(null);
        customer.setUpdatedAt(OffsetDateTime.now());
        Customer saved = customerRepository.save(customer);

        userRepository.findByCustomerId(id).ifPresent(u -> {
            u.setStatus("ACTIVE");
            u.setRejectionReason(null);
            u.setUpdatedAt(OffsetDateTime.now());
            userRepository.save(u);
        });

        return toDto(saved);
    }

    @Transactional
    public CustomerDto rejectCustomer(UUID id, String reason) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found"));
        customer.setStatus("REJECTED");
        customer.setRejectionReason(reason != null ? reason : "Application failed KYC identity verification requirements");
        customer.setUpdatedAt(OffsetDateTime.now());
        Customer saved = customerRepository.save(customer);

        userRepository.findByCustomerId(id).ifPresent(u -> {
            u.setStatus("REJECTED");
            u.setRejectionReason(reason != null ? reason : "Application failed KYC identity verification requirements");
            u.setUpdatedAt(OffsetDateTime.now());
            userRepository.save(u);
        });

        return toDto(saved);
    }

    @Transactional
    public CustomerDto updateCustomer(UUID id, CustomerUpdateRequest request) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found"));

        if (request.phone() != null && !request.phone().isBlank()) {
            customer.setPhone(request.phone().trim());
        }
        if (request.address() != null && !request.address().isBlank()) {
            customer.setAddress(request.address().trim());
        }
        if (request.occupation() != null) {
            customer.setOccupation(request.occupation().trim().isBlank() ? null : request.occupation().trim());
        }
        if (request.annualIncome() != null) {
            customer.setAnnualIncome(request.annualIncome());
        }
        if (request.emergencyContactName() != null) {
            customer.setEmergencyContactName(request.emergencyContactName().trim().isBlank() ? null : request.emergencyContactName().trim());
        }
        if (request.emergencyContactPhone() != null) {
            customer.setEmergencyContactPhone(request.emergencyContactPhone().trim().isBlank() ? null : request.emergencyContactPhone().trim());
        }

        customer.setUpdatedAt(OffsetDateTime.now());
        return toDto(customerRepository.save(customer));
    }

    @Transactional
    public CustomerDto deactivateCustomer(UUID id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found"));
        customer.setStatus("INACTIVE");
        customer.setUpdatedAt(OffsetDateTime.now());
        Customer saved = customerRepository.save(customer);

        userRepository.findByCustomerId(id).ifPresent(u -> {
            u.setStatus("INACTIVE");
            u.setUpdatedAt(OffsetDateTime.now());
            userRepository.save(u);
        });

        return toDto(saved);
    }

    public CustomerDto toDto(Customer c) {
        return new CustomerDto(
                c.getId(),
                c.getCustomerNumber(),
                c.getFirstName(),
                c.getLastName(),
                c.getEmail(),
                c.getPhone(),
                c.getAddress(),
                c.getStatus(),
                c.getDateOfBirth(),
                c.getGender(),
                c.getIdType(),
                c.getIdNumber(),
                c.getOccupation(),
                c.getAnnualIncome(),
                c.getEmergencyContactName(),
                c.getEmergencyContactPhone(),
                c.getRejectionReason(),
                c.getCreatedAt(),
                c.getUpdatedAt()
        );
    }
}
