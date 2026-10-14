package com.insurance.policy.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.UUID;

@FeignClient(name = "customer-service")
public interface CustomerClient {

    @GetMapping("/api/v1/customers/{id}")
    void getCustomer(@PathVariable("id") UUID id);
}
