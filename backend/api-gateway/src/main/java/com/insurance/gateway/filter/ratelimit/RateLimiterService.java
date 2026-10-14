package com.insurance.gateway.filter.ratelimit;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RateLimiterService {

    @Value("${gateway.rate-limit.default-replenish-rate:60}")
    private double defaultReplenishRate;

    @Value("${gateway.rate-limit.default-burst-capacity:100}")
    private long defaultBurstCapacity;

    @Value("${gateway.rate-limit.auth-replenish-rate:15}")
    private double authReplenishRate;

    @Value("${gateway.rate-limit.auth-burst-capacity:25}")
    private long authBurstCapacity;

    private final Map<String, TokenBucket> buckets = new ConcurrentHashMap<>();

    public RateLimitResult tryAcquire(String clientKey, boolean isAuthEndpoint) {
        long capacity = isAuthEndpoint ? authBurstCapacity : defaultBurstCapacity;
        double refillRate = (isAuthEndpoint ? authReplenishRate : defaultReplenishRate) / 60.0; // convert rate/min to rate/sec

        String bucketKey = (isAuthEndpoint ? "auth:" : "general:") + clientKey;
        TokenBucket bucket = buckets.computeIfAbsent(bucketKey, k -> new TokenBucket(capacity, refillRate));

        boolean allowed = bucket.tryConsume();
        long remaining = bucket.getAvailableTokens();
        return new RateLimitResult(allowed, capacity, remaining);
    }

    public record RateLimitResult(boolean allowed, long capacity, long remaining) {}
}
