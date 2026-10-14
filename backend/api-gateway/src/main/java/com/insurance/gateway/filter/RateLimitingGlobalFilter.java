package com.insurance.gateway.filter;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.insurance.gateway.filter.ratelimit.RateLimiterService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@Component
public class RateLimitingGlobalFilter implements GlobalFilter, Ordered {

    private static final Logger log = LoggerFactory.getLogger(RateLimitingGlobalFilter.class);

    @Value("${gateway.rate-limit.enabled:true}")
    private boolean enabled;

    private final RateLimiterService rateLimiterService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public RateLimitingGlobalFilter(RateLimiterService rateLimiterService) {
        this.rateLimiterService = rateLimiterService;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        if (!enabled) {
            return chain.filter(exchange);
        }

        ServerHttpRequest request = exchange.getRequest();
        String path = request.getURI().getPath();

        // Skip rate limiting for root redirect and actuator health endpoints
        if (path.equals("/") || path.startsWith("/actuator")) {
            return chain.filter(exchange);
        }

        String clientKey = resolveClientKey(request);
        boolean isAuthEndpoint = path.startsWith("/api/v1/auth/login") || path.startsWith("/api/v1/auth/register");

        RateLimiterService.RateLimitResult result = rateLimiterService.tryAcquire(clientKey, isAuthEndpoint);

        ServerHttpResponse response = exchange.getResponse();
        response.getHeaders().add("X-RateLimit-Limit", String.valueOf(result.capacity()));
        response.getHeaders().add("X-RateLimit-Remaining", String.valueOf(result.remaining()));

        if (!result.allowed()) {
            log.warn("Rate limit exceeded for client '{}' on path '{}'", clientKey, path);
            response.setStatusCode(HttpStatus.TOO_MANY_REQUESTS);
            response.getHeaders().add(HttpHeaders.RETRY_AFTER, "60");
            response.getHeaders().setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> errorBody = new LinkedHashMap<>();
            errorBody.put("timestamp", Instant.now().toString());
            errorBody.put("status", HttpStatus.TOO_MANY_REQUESTS.value());
            errorBody.put("error", "Too Many Requests");
            errorBody.put("message", isAuthEndpoint
                    ? "Too many authentication requests. Please wait 1 minute before trying again."
                    : "Rate limit exceeded. Too many requests have been made from your client. Please try again shortly.");
            errorBody.put("path", path);

            byte[] bytes;
            try {
                bytes = objectMapper.writeValueAsBytes(errorBody);
            } catch (JsonProcessingException e) {
                bytes = "{\"status\":429,\"error\":\"Too Many Requests\"}".getBytes(StandardCharsets.UTF_8);
            }

            DataBuffer buffer = response.bufferFactory().wrap(bytes);
            return response.writeWith(Mono.just(buffer));
        }

        return chain.filter(exchange);
    }

    private String resolveClientKey(ServerHttpRequest request) {
        // 1. If Authorization header present, track by user token
        String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (authHeader != null && authHeader.startsWith("Bearer ") && authHeader.length() > 20) {
            return "user:" + authHeader.substring(authHeader.length() - 12);
        }

        // 2. Otherwise track by client IP address
        String xForwardedFor = request.getHeaders().getFirst("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return "ip:" + xForwardedFor.split(",")[0].trim();
        }

        InetSocketAddress remoteAddress = request.getRemoteAddress();
        if (remoteAddress != null && remoteAddress.getAddress() != null) {
            return "ip:" + remoteAddress.getAddress().getHostAddress();
        }

        return "ip:anonymous";
    }

    @Override
    public int getOrder() {
        return -10; // Execute early in filter chain
    }
}
