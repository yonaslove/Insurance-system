package com.insurance.gateway.filter.ratelimit;

public class TokenBucket {
    private final long capacity;
    private final double refillRatePerSecond;
    private double tokens;
    private long lastRefillTimestamp;

    public TokenBucket(long capacity, double refillRatePerSecond) {
        this.capacity = capacity;
        this.refillRatePerSecond = refillRatePerSecond;
        this.tokens = capacity;
        this.lastRefillTimestamp = System.currentTimeMillis();
    }

    public synchronized boolean tryConsume() {
        refill();
        if (tokens >= 1.0) {
            tokens -= 1.0;
            return true;
        }
        return false;
    }

    public synchronized long getAvailableTokens() {
        refill();
        return (long) Math.max(0, tokens);
    }

    public long getCapacity() {
        return capacity;
    }

    private void refill() {
        long now = System.currentTimeMillis();
        double elapsedSeconds = (now - lastRefillTimestamp) / 1000.0;
        if (elapsedSeconds > 0) {
            tokens = Math.min(capacity, tokens + (elapsedSeconds * refillRatePerSecond));
            lastRefillTimestamp = now;
        }
    }
}
