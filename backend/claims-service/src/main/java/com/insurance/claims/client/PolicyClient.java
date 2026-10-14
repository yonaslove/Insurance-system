package com.insurance.claims.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.UUID;

@FeignClient(name = "policy-service")
public interface PolicyClient {

    @GetMapping("/api/v1/policies/{id}")
    void getPolicy(@PathVariable("id") UUID id);
}
