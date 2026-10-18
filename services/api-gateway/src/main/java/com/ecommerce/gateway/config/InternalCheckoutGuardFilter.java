package com.ecommerce.gateway.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.time.Instant;

/**
 * Stage 9E: Fix 3 — Disable Internal Checkout and Mock Payments by Default
 *
 * Intercepts customer cart mutations, order creation, and payment initiation when
 * internal checkout is disabled (the default setting).
 *
 * When disabled (default):
 * - Cart creation/modification: POST, PUT, DELETE, PATCH on /api/v1/cart/**
 * - Order creation: POST /api/v1/orders
 * - Order simulation: POST /api/v1/orders/{id}/simulate-status
 * - Payment initiation: POST /api/v1/payments (excluding admin refund)
 *
 * Preserves:
 * - All GET reads for historical orders (/api/v1/orders, /api/v1/orders/{id}, /api/v1/orders/{id}/tracking, /api/v1/orders/all)
 * - All GET reads for payments (/api/v1/payments/orders/{orderId})
 * - Admin refund: POST /api/v1/payments/orders/{orderId}/refund
 * - Actuator and health checks (/actuator/**)
 * - Authentication (/api/v1/auth/**)
 * - Product catalog (/api/v1/products/**, /api/v1/categories/**)
 */
@Slf4j
@Component
public class InternalCheckoutGuardFilter implements GlobalFilter, Ordered {

    @Value("${app.feature.internal-checkout.enabled:${ENABLE_INTERNAL_CHECKOUT:false}}")
    private boolean enableInternalCheckout;

    @Override
    public int getOrder() {
        // Run early in the gateway filter chain (before route routing filters)
        return -10;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        if (enableInternalCheckout) {
            return chain.filter(exchange);
        }

        ServerHttpRequest request = exchange.getRequest();
        String path = request.getURI().getPath();
        HttpMethod method = request.getMethod();

        if (isBlockedMutation(path, method)) {
            log.warn("Blocked direct checkout API mutation attempt: {} {} (ENABLE_INTERNAL_CHECKOUT=false)", method, path);
            return blockRequest(exchange, path);
        }

        return chain.filter(exchange);
    }

    public boolean isBlockedMutation(String path, HttpMethod method) {
        if (path == null || method == null) {
            return false;
        }

        // Cart mutations: POST, PUT, DELETE, PATCH on /api/v1/cart/**
        if (path.startsWith("/api/v1/cart")) {
            return method == HttpMethod.POST || method == HttpMethod.PUT
                    || method == HttpMethod.DELETE || method == HttpMethod.PATCH;
        }

        // Order mutations:
        // POST /api/v1/orders (order creation)
        if (path.equals("/api/v1/orders") && method == HttpMethod.POST) {
            return true;
        }
        // POST /api/v1/orders/{id}/simulate-status
        if (path.startsWith("/api/v1/orders/") && path.endsWith("/simulate-status") && method == HttpMethod.POST) {
            return true;
        }

        // Payment initiation:
        // POST /api/v1/payments (exact match or /api/v1/payments/)
        // Preserves admin refund: POST /api/v1/payments/orders/{orderId}/refund
        if ((path.equals("/api/v1/payments") || path.equals("/api/v1/payments/")) && method == HttpMethod.POST) {
            return true;
        }

        return false;
    }

    private Mono<Void> blockRequest(ServerWebExchange exchange, String path) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(HttpStatus.FORBIDDEN);
        response.getHeaders().setContentType(MediaType.APPLICATION_JSON);

        String body = String.format(
                "{\"type\":\"about:blank\",\"title\":\"Forbidden\",\"status\":403,\"detail\":\"Internal checkout and mock payments are disabled. LUMIÈRE acquisitions are conducted via verified atelier referrals or concierge inquiries.\",\"instance\":\"%s\",\"timestamp\":\"%s\"}",
                path,
                Instant.now()
        );

        byte[] bytes = body.getBytes(StandardCharsets.UTF_8);
        DataBuffer buffer = response.bufferFactory().wrap(bytes);
        return response.writeWith(Mono.just(buffer));
    }
}
