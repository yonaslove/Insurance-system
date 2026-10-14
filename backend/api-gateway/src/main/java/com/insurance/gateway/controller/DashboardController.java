package com.insurance.gateway.controller;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.http.HttpHeaders;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/dashboard")
public class DashboardController {

    private final WebClient client;

    public DashboardController(WebClient.Builder loadBalancedWebClientBuilder) {
        this.client = loadBalancedWebClientBuilder.build();
    }

    @GetMapping("/summary")
    public Mono<Map<String, Object>> summary(
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization) {

        Mono<Long> customers = totalElements("lb://customer-service/api/v1/customers?size=1", authorization);
        Mono<Long> activePolicies = totalElements("lb://policy-service/api/v1/policies?status=ACTIVE&size=1", authorization);
        Mono<Long> submittedClaims = totalElements("lb://claims-service/api/v1/claims?status=SUBMITTED&size=1", authorization);
        Mono<Long> reviewClaims = totalElements("lb://claims-service/api/v1/claims?status=UNDER_REVIEW&size=1", authorization);
        Mono<BigDecimal> totalPayments = totalPayments(authorization);

        return Mono.zip(customers, activePolicies, submittedClaims, reviewClaims, totalPayments)
                .map(tuple -> {
                    Map<String, Object> body = new LinkedHashMap<>();
                    body.put("totalCustomers", tuple.getT1());
                    body.put("activePolicies", tuple.getT2());
                    body.put("openClaims", tuple.getT3() + tuple.getT4());
                    body.put("totalPaymentsAmount", tuple.getT5());
                    body.put("currency", "USD");
                    body.put("recentActivities", List.of());
                    return body;
                });
    }

    private Mono<Long> totalElements(String url, String authorization) {
        return client.get().uri(url)
                .headers(headers -> {
                    if (authorization != null) {
                        headers.set(HttpHeaders.AUTHORIZATION, authorization);
                    }
                })
                .retrieve()
                .bodyToMono(JsonNode.class)
                .map(node -> node.path("totalElements").asLong(0L))
                .onErrorReturn(0L);
    }

    private Mono<BigDecimal> totalPayments(String authorization) {
        return client.get().uri("lb://payment-service/api/v1/payments/summary")
                .headers(headers -> {
                    if (authorization != null) {
                        headers.set(HttpHeaders.AUTHORIZATION, authorization);
                    }
                })
                .retrieve()
                .bodyToMono(JsonNode.class)
                .map(node -> node.path("totalAmount").decimalValue())
                .onErrorReturn(BigDecimal.ZERO);
    }
}
