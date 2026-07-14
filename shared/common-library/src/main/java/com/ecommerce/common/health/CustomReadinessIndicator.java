package com.ecommerce.common.health;

import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;

@Component
public class CustomReadinessIndicator implements HealthIndicator {

    @Override
    public Health health() {
        return Health.up().withDetail("status", "Ready to accept traffic").build();
    }
}
