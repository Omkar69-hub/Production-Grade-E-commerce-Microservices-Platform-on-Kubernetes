package com.ecommerce.gateway.config;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;
import org.springframework.test.util.ReflectionTestUtils;
import reactor.core.publisher.Mono;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Stage 9E: InternalCheckoutGuardFilter Gateway Security Tests")
class InternalCheckoutGuardFilterTest {

    private InternalCheckoutGuardFilter filter;

    @Mock
    private GatewayFilterChain chain;

    @BeforeEach
    void setUp() {
        filter = new InternalCheckoutGuardFilter();
        // Default: internal checkout disabled
        ReflectionTestUtils.setField(filter, "enableInternalCheckout", false);
    }

    @Test
    @DisplayName("Filter order precedence is set before routing filters")
    void testFilterOrder() {
        assertThat(filter.getOrder()).isEqualTo(-10);
    }

    @Nested
    @DisplayName("1. Mutation Path Blocking Evaluation")
    class MutationPathBlockingTests {

        @Test
        @DisplayName("Blocks customer cart mutation methods (POST, PUT, DELETE, PATCH)")
        void testCartMutationsBlocked() {
            assertThat(filter.isBlockedMutation("/api/v1/cart/items", HttpMethod.POST)).isTrue();
            assertThat(filter.isBlockedMutation("/api/v1/cart/items/item-123", HttpMethod.PUT)).isTrue();
            assertThat(filter.isBlockedMutation("/api/v1/cart/items/item-123", HttpMethod.DELETE)).isTrue();
            assertThat(filter.isBlockedMutation("/api/v1/cart", HttpMethod.DELETE)).isTrue();
            assertThat(filter.isBlockedMutation("/api/v1/cart/items", HttpMethod.PATCH)).isTrue();
        }

        @Test
        @DisplayName("Blocks order creation (POST /api/v1/orders)")
        void testOrderCreationBlocked() {
            assertThat(filter.isBlockedMutation("/api/v1/orders", HttpMethod.POST)).isTrue();
        }

        @Test
        @DisplayName("Blocks simulated status transition (POST /api/v1/orders/{id}/simulate-status)")
        void testSimulateStatusBlocked() {
            assertThat(filter.isBlockedMutation("/api/v1/orders/123e4567-e89b-12d3-a456-426614174000/simulate-status", HttpMethod.POST)).isTrue();
        }

        @Test
        @DisplayName("Blocks direct customer payment initiation (POST /api/v1/payments)")
        void testPaymentInitiationBlocked() {
            assertThat(filter.isBlockedMutation("/api/v1/payments", HttpMethod.POST)).isTrue();
            assertThat(filter.isBlockedMutation("/api/v1/payments/", HttpMethod.POST)).isTrue();
        }

        @Test
        @DisplayName("Preserves historical order reads and administrative order views")
        void testHistoricalOrderReadsPreserved() {
            assertThat(filter.isBlockedMutation("/api/v1/orders", HttpMethod.GET)).isFalse();
            assertThat(filter.isBlockedMutation("/api/v1/orders/123e4567-e89b-12d3-a456-426614174000", HttpMethod.GET)).isFalse();
            assertThat(filter.isBlockedMutation("/api/v1/orders/123e4567-e89b-12d3-a456-426614174000/tracking", HttpMethod.GET)).isFalse();
            assertThat(filter.isBlockedMutation("/api/v1/orders/all", HttpMethod.GET)).isFalse();
        }

        @Test
        @DisplayName("Preserves historical payment reads and admin refund operations")
        void testPaymentReadsAndRefundPreserved() {
            assertThat(filter.isBlockedMutation("/api/v1/payments/orders/123e4567-e89b-12d3-a456-426614174000", HttpMethod.GET)).isFalse();
            assertThat(filter.isBlockedMutation("/api/v1/payments/orders/123e4567-e89b-12d3-a456-426614174000/refund", HttpMethod.POST)).isFalse();
        }

        @Test
        @DisplayName("Preserves public product catalog, auth, and health checks")
        void testPublicAndInfrastructureEndpointsPreserved() {
            assertThat(filter.isBlockedMutation("/api/v1/products", HttpMethod.GET)).isFalse();
            assertThat(filter.isBlockedMutation("/api/v1/products/prod-123", HttpMethod.GET)).isFalse();
            assertThat(filter.isBlockedMutation("/api/v1/categories", HttpMethod.GET)).isFalse();
            assertThat(filter.isBlockedMutation("/api/v1/auth/login", HttpMethod.POST)).isFalse();
            assertThat(filter.isBlockedMutation("/api/v1/auth/register", HttpMethod.POST)).isFalse();
            assertThat(filter.isBlockedMutation("/actuator/health", HttpMethod.GET)).isFalse();
        }
    }

    @Nested
    @DisplayName("2. Gateway Filter Execution When Disabled (Default)")
    class DisabledFilterExecutionTests {

        @Test
        @DisplayName("Returns HTTP 403 Forbidden and halts chain on blocked order creation")
        void testOrderCreationReturns403() {
            MockServerHttpRequest request = MockServerHttpRequest.post("/api/v1/orders").build();
            MockServerWebExchange exchange = MockServerWebExchange.from(request);

            filter.filter(exchange, chain).block();

            assertThat(exchange.getResponse().getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
            assertThat(exchange.getResponse().getHeaders().getContentType().toString()).contains("application/json");
            verify(chain, never()).filter(any());
        }

        @Test
        @DisplayName("Returns HTTP 403 Forbidden and halts chain on blocked payment initiation")
        void testPaymentInitiationReturns403() {
            MockServerHttpRequest request = MockServerHttpRequest.post("/api/v1/payments").build();
            MockServerWebExchange exchange = MockServerWebExchange.from(request);

            filter.filter(exchange, chain).block();

            assertThat(exchange.getResponse().getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
            verify(chain, never()).filter(any());
        }

        @Test
        @DisplayName("Returns HTTP 403 Forbidden and halts chain on blocked cart addition")
        void testCartAdditionReturns403() {
            MockServerHttpRequest request = MockServerHttpRequest.post("/api/v1/cart/items").build();
            MockServerWebExchange exchange = MockServerWebExchange.from(request);

            filter.filter(exchange, chain).block();

            assertThat(exchange.getResponse().getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
            verify(chain, never()).filter(any());
        }

        @Test
        @DisplayName("Passes through legitimate historical order read")
        void testHistoricalOrderReadPassesThrough() {
            when(chain.filter(any())).thenReturn(Mono.empty());

            MockServerHttpRequest request = MockServerHttpRequest.get("/api/v1/orders").build();
            MockServerWebExchange exchange = MockServerWebExchange.from(request);

            filter.filter(exchange, chain).block();

            verify(chain, times(1)).filter(exchange);
            assertThat(exchange.getResponse().getStatusCode()).isNull();
        }

        @Test
        @DisplayName("Passes through actuator health checks")
        void testHealthCheckPassesThrough() {
            when(chain.filter(any())).thenReturn(Mono.empty());

            MockServerHttpRequest request = MockServerHttpRequest.get("/actuator/health").build();
            MockServerWebExchange exchange = MockServerWebExchange.from(request);

            filter.filter(exchange, chain).block();

            verify(chain, times(1)).filter(exchange);
        }
    }

    @Nested
    @DisplayName("3. Gateway Filter Execution When Explicitly Enabled")
    class EnabledFilterExecutionTests {

        @Test
        @DisplayName("Allows order creation to proceed downstream when feature flag is true")
        void testOrderCreationAllowedWhenEnabled() {
            ReflectionTestUtils.setField(filter, "enableInternalCheckout", true);
            when(chain.filter(any())).thenReturn(Mono.empty());

            MockServerHttpRequest request = MockServerHttpRequest.post("/api/v1/orders").build();
            MockServerWebExchange exchange = MockServerWebExchange.from(request);

            filter.filter(exchange, chain).block();

            verify(chain, times(1)).filter(exchange);
        }

        @Test
        @DisplayName("Allows payment initiation to proceed downstream when feature flag is true")
        void testPaymentAllowedWhenEnabled() {
            ReflectionTestUtils.setField(filter, "enableInternalCheckout", true);
            when(chain.filter(any())).thenReturn(Mono.empty());

            MockServerHttpRequest request = MockServerHttpRequest.post("/api/v1/payments").build();
            MockServerWebExchange exchange = MockServerWebExchange.from(request);

            filter.filter(exchange, chain).block();

            verify(chain, times(1)).filter(exchange);
        }
    }
}
