package com.ecommerce.order.service;

import com.ecommerce.common.dto.PageResponse;
import com.ecommerce.common.dto.PaginationDto;
import com.ecommerce.common.exception.BusinessException;
import com.ecommerce.common.exception.ForbiddenException;
import com.ecommerce.common.response.SuccessResponse;
import com.ecommerce.order.client.CartServiceClient;
import com.ecommerce.order.client.ProductServiceClient;
import com.ecommerce.order.dto.OrderRequest;
import com.ecommerce.order.dto.OrderResponse;
import com.ecommerce.order.dto.OrderTrackingResponse;
import com.ecommerce.order.dto.ShippingAddressDto;
import com.ecommerce.order.dto.SimulateStatusRequest;
import com.ecommerce.order.entity.Order;
import com.ecommerce.order.entity.OrderStatus;
import com.ecommerce.order.event.OrderCreatedEvent;
import com.ecommerce.order.event.OrderEventPublisher;
import com.ecommerce.order.mapper.OrderMapper;
import com.ecommerce.order.repository.OrderRepository;
import com.ecommerce.order.repository.OrderStatusHistoryRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceSecurityTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private OrderStatusHistoryRepository statusHistoryRepository;

    @Mock
    private CartServiceClient cartServiceClient;

    @Mock
    private ProductServiceClient productServiceClient;

    @Mock
    private OrderMapper orderMapper;

    @Mock
    private OrderEventPublisher eventPublisher;

    @Spy
    private ObjectMapper objectMapper = new ObjectMapper();

    @InjectMocks
    private OrderService orderService;

    private UUID userId;
    private UUID productId;
    private String token;
    private OrderRequest validRequest;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        productId = UUID.randomUUID();
        token = "mock-jwt-token";

        ShippingAddressDto address = ShippingAddressDto.builder()
                .fullName("Lumière Client")
                .street("15 Rue du Faubourg")
                .city("Paris")
                .state("Île-de-France")
                .zipCode("75008")
                .country("France")
                .phoneNumber("+33140000000")
                .build();

        validRequest = OrderRequest.builder()
                .shippingAddress(address)
                .paymentMethod("CREDIT_CARD")
                .notes("Discreet atelier packaging please")
                .build();

        ReflectionTestUtils.setField(orderService, "enableInternalCheckout", true);
    }

    private ProductServiceClient.ProductDto buildValidProductDto() {
        return ProductServiceClient.ProductDto.builder()
                .id(productId)
                .name("Handcrafted Velvet Evening Coat")
                .sku("LUM-VLV-COAT-01")
                .price(BigDecimal.valueOf(1450.00))
                .imageUrl("https://images.unsplash.com/velvet-coat")
                .status("ACTIVE")
                .attributes("{\"fabric\":\"Italian Velvet\",\"color\":\"Midnight Blue\"}")
                .build();
    }

    private ProductServiceClient.InventoryDto buildInventoryDto(int quantity) {
        return ProductServiceClient.InventoryDto.builder()
                .productId(productId)
                .quantityAvailable(quantity)
                .reservedQuantity(0)
                .build();
    }

    private CartServiceClient.CartDto buildCartWithItem(UUID pId, int qty, BigDecimal clientPrice) {
        CartServiceClient.CartItemDto item = CartServiceClient.CartItemDto.builder()
                .productId(pId)
                .sku("LUM-VLV-COAT-01")
                .name("Handcrafted Velvet Evening Coat")
                .quantity(qty)
                .price(clientPrice)
                .totalLinePrice(clientPrice.multiply(BigDecimal.valueOf(qty)))
                .build();

        return CartServiceClient.CartDto.builder()
                .userId(userId)
                .items(List.of(item))
                .subtotal(clientPrice.multiply(BigDecimal.valueOf(qty)))
                .build();
    }

    @Nested
    @DisplayName("1. Legitimate Active Internal Product Tests")
    class LegitimateProductTests {

        @Test
        @DisplayName("Legitimate active internal product with positive price succeeds and recalculates totals from authoritative price")
        void givenLegitimateProduct_whenCreateOrder_thenSucceedsWithAuthoritativeAmounts() {
            // Cart has client-supplied price of $1.00 (tampered), but authoritative price is $1450.00
            CartServiceClient.CartDto cart = buildCartWithItem(productId, 2, BigDecimal.valueOf(1.00));
            when(cartServiceClient.getCart(any())).thenReturn(SuccessResponse.<CartServiceClient.CartDto>builder().data(cart).build());

            ProductServiceClient.ProductDto authoritativeProduct = buildValidProductDto();
            when(productServiceClient.getProduct(productId)).thenReturn(SuccessResponse.<ProductServiceClient.ProductDto>builder().data(authoritativeProduct).build());
            when(productServiceClient.getInventory(productId)).thenReturn(SuccessResponse.<ProductServiceClient.InventoryDto>builder().data(buildInventoryDto(10)).build());

            when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> {
                Order order = invocation.getArgument(0);
                order.setId(UUID.randomUUID());
                return order;
            });
            when(orderMapper.toResponse(any())).thenReturn(OrderResponse.builder().orderNumber("ORD-TEST").build());

            OrderResponse response = orderService.createOrder(userId, token, validRequest);

            assertThat(response).isNotNull();

            // Verify order saved with authoritative total: 2 * 1450.00 = 2900.00 (NOT 2.00)
            ArgumentCaptor<Order> orderCaptor = ArgumentCaptor.forClass(Order.class);
            verify(orderRepository).save(orderCaptor.capture());
            Order savedOrder = orderCaptor.getValue();

            assertThat(savedOrder.getTotalAmount()).isEqualByComparingTo(BigDecimal.valueOf(2900.00));
            assertThat(savedOrder.getItems()).hasSize(1);
            assertThat(savedOrder.getItems().get(0).getUnitPrice()).isEqualByComparingTo(BigDecimal.valueOf(1450.00));
            assertThat(savedOrder.getItems().get(0).getTotalPrice()).isEqualByComparingTo(BigDecimal.valueOf(2900.00));

            // Verify inventory deducted by 2
            ArgumentCaptor<ProductServiceClient.InventoryUpdateRequest> invCaptor = ArgumentCaptor.forClass(ProductServiceClient.InventoryUpdateRequest.class);
            verify(productServiceClient).updateInventory(any(), eq(productId), invCaptor.capture());
            assertThat(invCaptor.getValue().getQuantityAvailable()).isEqualTo(8);

            // Verify cart cleared and event published
            verify(cartServiceClient).clearCart(any());
            verify(eventPublisher).publishOrderCreated(any(OrderCreatedEvent.class));
        }
    }

    @Nested
    @DisplayName("2. Zero or Negative Price Rejections")
    class ZeroOrNegativePriceTests {

        @Test
        @DisplayName("Product with zero price is rejected with BusinessException before reservation")
        void givenZeroPriceProduct_whenCreateOrder_thenRejected() {
            CartServiceClient.CartDto cart = buildCartWithItem(productId, 1, BigDecimal.ZERO);
            when(cartServiceClient.getCart(any())).thenReturn(SuccessResponse.<CartServiceClient.CartDto>builder().data(cart).build());

            ProductServiceClient.ProductDto product = buildValidProductDto();
            product.setPrice(BigDecimal.ZERO);
            when(productServiceClient.getProduct(productId)).thenReturn(SuccessResponse.<ProductServiceClient.ProductDto>builder().data(product).build());

            assertThatThrownBy(() -> orderService.createOrder(userId, token, validRequest))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("Items with zero, negative, or unverified pricing cannot be ordered");

            // Verify no downstream execution
            verify(productServiceClient, never()).updateInventory(any(), any(), any());
            verify(orderRepository, never()).save(any());
            verify(cartServiceClient, never()).clearCart(any());
            verify(eventPublisher, never()).publishOrderCreated(any());
        }

        @Test
        @DisplayName("Product with negative price is rejected with BusinessException before reservation")
        void givenNegativePriceProduct_whenCreateOrder_thenRejected() {
            CartServiceClient.CartDto cart = buildCartWithItem(productId, 1, BigDecimal.valueOf(-50.00));
            when(cartServiceClient.getCart(any())).thenReturn(SuccessResponse.<CartServiceClient.CartDto>builder().data(cart).build());

            ProductServiceClient.ProductDto product = buildValidProductDto();
            product.setPrice(BigDecimal.valueOf(-25.00));
            when(productServiceClient.getProduct(productId)).thenReturn(SuccessResponse.<ProductServiceClient.ProductDto>builder().data(product).build());

            assertThatThrownBy(() -> orderService.createOrder(userId, token, validRequest))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("Items with zero, negative, or unverified pricing cannot be ordered");

            verify(orderRepository, never()).save(any());
        }

        @Test
        @DisplayName("Product with null price is rejected with BusinessException")
        void givenNullPriceProduct_whenCreateOrder_thenRejected() {
            CartServiceClient.CartDto cart = buildCartWithItem(productId, 1, BigDecimal.valueOf(100.00));
            when(cartServiceClient.getCart(any())).thenReturn(SuccessResponse.<CartServiceClient.CartDto>builder().data(cart).build());

            ProductServiceClient.ProductDto product = buildValidProductDto();
            product.setPrice(null);
            when(productServiceClient.getProduct(productId)).thenReturn(SuccessResponse.<ProductServiceClient.ProductDto>builder().data(product).build());

            assertThatThrownBy(() -> orderService.createOrder(userId, token, validRequest))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("Items with zero, negative, or unverified pricing cannot be ordered");

            verify(orderRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("3. Referral Product Rejections via Destination URL")
    class DestinationUrlReferralTests {

        @Test
        @DisplayName("Product with non-blank destinationUrl is rejected as external referral")
        void givenProductWithDestinationUrl_whenCreateOrder_thenRejected() {
            CartServiceClient.CartDto cart = buildCartWithItem(productId, 1, BigDecimal.valueOf(1200.00));
            when(cartServiceClient.getCart(any())).thenReturn(SuccessResponse.<CartServiceClient.CartDto>builder().data(cart).build());

            ProductServiceClient.ProductDto product = buildValidProductDto();
            product.setAttributes("{\"destinationUrl\":\"https://www.chanel.com/creations/jacket\",\"brand\":\"Chanel\"}");
            when(productServiceClient.getProduct(productId)).thenReturn(SuccessResponse.<ProductServiceClient.ProductDto>builder().data(product).build());

            assertThatThrownBy(() -> orderService.createOrder(userId, token, validRequest))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("External atelier referral creations cannot be ordered internally");

            verify(productServiceClient, never()).updateInventory(any(), any(), any());
            verify(orderRepository, never()).save(any());
            verify(cartServiceClient, never()).clearCart(any());
        }
    }

    @Nested
    @DisplayName("4. PRICE_UPON_INQUIRY Rejections")
    class PriceUponInquiryTests {

        @Test
        @DisplayName("Product with priceVerificationStatus PRICE_UPON_INQUIRY is rejected")
        void givenPriceUponInquiry_whenCreateOrder_thenRejected() {
            CartServiceClient.CartDto cart = buildCartWithItem(productId, 1, BigDecimal.valueOf(5000.00));
            when(cartServiceClient.getCart(any())).thenReturn(SuccessResponse.<CartServiceClient.CartDto>builder().data(cart).build());

            ProductServiceClient.ProductDto product = buildValidProductDto();
            product.setAttributes("{\"priceVerificationStatus\":\"PRICE_UPON_INQUIRY\",\"collection\":\"Haute Couture\"}");
            when(productServiceClient.getProduct(productId)).thenReturn(SuccessResponse.<ProductServiceClient.ProductDto>builder().data(product).build());

            assertThatThrownBy(() -> orderService.createOrder(userId, token, validRequest))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("Creations priced upon atelier inquiry cannot be ordered internally");

            verify(orderRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("5. Referral Markers (Destination Type, isReferral, Fulfillment Type)")
    class ReferralMarkersTests {

        @Test
        @DisplayName("Product with destinationType is rejected")
        void givenDestinationType_whenCreateOrder_thenRejected() {
            CartServiceClient.CartDto cart = buildCartWithItem(productId, 1, BigDecimal.valueOf(800.00));
            when(cartServiceClient.getCart(any())).thenReturn(SuccessResponse.<CartServiceClient.CartDto>builder().data(cart).build());

            ProductServiceClient.ProductDto product = buildValidProductDto();
            product.setAttributes("{\"destinationType\":\"OFFICIAL_BRAND_BOUTIQUE\"}");
            when(productServiceClient.getProduct(productId)).thenReturn(SuccessResponse.<ProductServiceClient.ProductDto>builder().data(product).build());

            assertThatThrownBy(() -> orderService.createOrder(userId, token, validRequest))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("External atelier referral creations cannot be ordered internally");

            verify(orderRepository, never()).save(any());
        }

        @Test
        @DisplayName("Product with isReferral=true is rejected")
        void givenIsReferralTrue_whenCreateOrder_thenRejected() {
            CartServiceClient.CartDto cart = buildCartWithItem(productId, 1, BigDecimal.valueOf(800.00));
            when(cartServiceClient.getCart(any())).thenReturn(SuccessResponse.<CartServiceClient.CartDto>builder().data(cart).build());

            ProductServiceClient.ProductDto product = buildValidProductDto();
            product.setAttributes("{\"isReferral\":true}");
            when(productServiceClient.getProduct(productId)).thenReturn(SuccessResponse.<ProductServiceClient.ProductDto>builder().data(product).build());

            assertThatThrownBy(() -> orderService.createOrder(userId, token, validRequest))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("External atelier referral creations cannot be ordered internally");

            verify(orderRepository, never()).save(any());
        }

        @Test
        @DisplayName("Product with REFERRAL_LINK fulfillmentType is rejected")
        void givenReferralLinkFulfillment_whenCreateOrder_thenRejected() {
            CartServiceClient.CartDto cart = buildCartWithItem(productId, 1, BigDecimal.valueOf(800.00));
            when(cartServiceClient.getCart(any())).thenReturn(SuccessResponse.<CartServiceClient.CartDto>builder().data(cart).build());

            ProductServiceClient.ProductDto product = buildValidProductDto();
            product.setAttributes("{\"fulfillmentType\":\"REFERRAL_LINK\"}");
            when(productServiceClient.getProduct(productId)).thenReturn(SuccessResponse.<ProductServiceClient.ProductDto>builder().data(product).build());

            assertThatThrownBy(() -> orderService.createOrder(userId, token, validRequest))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("External atelier referral creations cannot be ordered internally");

            verify(orderRepository, never()).save(any());
        }

        @Test
        @DisplayName("Product with isEditorialConcept=true is rejected")
        void givenIsEditorialConceptTrue_whenCreateOrder_thenRejected() {
            CartServiceClient.CartDto cart = buildCartWithItem(productId, 1, BigDecimal.valueOf(800.00));
            when(cartServiceClient.getCart(any())).thenReturn(SuccessResponse.<CartServiceClient.CartDto>builder().data(cart).build());

            ProductServiceClient.ProductDto product = buildValidProductDto();
            product.setAttributes("{\"isEditorialConcept\":true}");
            when(productServiceClient.getProduct(productId)).thenReturn(SuccessResponse.<ProductServiceClient.ProductDto>builder().data(product).build());

            assertThatThrownBy(() -> orderService.createOrder(userId, token, validRequest))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("Editorial concepts cannot be ordered internally");

            verify(orderRepository, never()).save(any());
        }

        @Test
        @DisplayName("Product with unknown fulfillmentType is rejected fail-closed")
        void givenUnknownFulfillmentType_whenCreateOrder_thenRejected() {
            CartServiceClient.CartDto cart = buildCartWithItem(productId, 1, BigDecimal.valueOf(800.00));
            when(cartServiceClient.getCart(any())).thenReturn(SuccessResponse.<CartServiceClient.CartDto>builder().data(cart).build());

            ProductServiceClient.ProductDto product = buildValidProductDto();
            product.setAttributes("{\"fulfillmentType\":\"DROPSHIP\"}");
            when(productServiceClient.getProduct(productId)).thenReturn(SuccessResponse.<ProductServiceClient.ProductDto>builder().data(product).build());

            assertThatThrownBy(() -> orderService.createOrder(userId, token, validRequest))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("Unknown or unsupported fulfillment type");

            verify(orderRepository, never()).save(any());
        }

        @Test
        @DisplayName("Product with INTERNAL fulfillmentType and positive price succeeds")
        void givenInternalFulfillment_whenCreateOrder_thenSucceeds() {
            CartServiceClient.CartDto cart = buildCartWithItem(productId, 1, BigDecimal.valueOf(800.00));
            when(cartServiceClient.getCart(any())).thenReturn(SuccessResponse.<CartServiceClient.CartDto>builder().data(cart).build());

            ProductServiceClient.ProductDto product = buildValidProductDto();
            product.setAttributes("{\"fulfillmentType\":\"INTERNAL\",\"fabric\":\"Silk\"}");
            when(productServiceClient.getProduct(productId)).thenReturn(SuccessResponse.<ProductServiceClient.ProductDto>builder().data(product).build());
            when(productServiceClient.getInventory(productId)).thenReturn(SuccessResponse.<ProductServiceClient.InventoryDto>builder().data(ProductServiceClient.InventoryDto.builder().quantityAvailable(10).build()).build());
            when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> {
                Order o = invocation.getArgument(0);
                o.setId(UUID.randomUUID());
                return o;
            });
            when(orderMapper.toResponse(any(Order.class))).thenReturn(OrderResponse.builder().id(UUID.randomUUID()).totalAmount(BigDecimal.valueOf(800.00)).build());

            OrderResponse response = orderService.createOrder(userId, token, validRequest);
            assertThat(response).isNotNull();
            verify(orderRepository).save(any(Order.class));
        }
    }

    @Nested
    @DisplayName("6. Inactive, Unavailable, or Malformed Products Fail Closed")
    class FailClosedTests {

        @Test
        @DisplayName("Inactive product is rejected with BusinessException")
        void givenInactiveProduct_whenCreateOrder_thenRejected() {
            CartServiceClient.CartDto cart = buildCartWithItem(productId, 1, BigDecimal.valueOf(800.00));
            when(cartServiceClient.getCart(any())).thenReturn(SuccessResponse.<CartServiceClient.CartDto>builder().data(cart).build());

            ProductServiceClient.ProductDto product = buildValidProductDto();
            product.setStatus("INACTIVE");
            when(productServiceClient.getProduct(productId)).thenReturn(SuccessResponse.<ProductServiceClient.ProductDto>builder().data(product).build());

            assertThatThrownBy(() -> orderService.createOrder(userId, token, validRequest))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("Product is not available for purchase");

            verify(orderRepository, never()).save(any());
        }

        @Test
        @DisplayName("Unavailable product service response fails closed")
        void givenProductServiceFailure_whenCreateOrder_thenFailsClosed() {
            CartServiceClient.CartDto cart = buildCartWithItem(productId, 1, BigDecimal.valueOf(800.00));
            when(cartServiceClient.getCart(any())).thenReturn(SuccessResponse.<CartServiceClient.CartDto>builder().data(cart).build());

            when(productServiceClient.getProduct(productId)).thenThrow(new RuntimeException("Product service timeout"));

            assertThatThrownBy(() -> orderService.createOrder(userId, token, validRequest))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("Unable to verify authoritative product details for product");

            verify(orderRepository, never()).save(any());
            verify(productServiceClient, never()).updateInventory(any(), any(), any());
        }

        @Test
        @DisplayName("Null product data from Product Service fails closed")
        void givenNullProductData_whenCreateOrder_thenFailsClosed() {
            CartServiceClient.CartDto cart = buildCartWithItem(productId, 1, BigDecimal.valueOf(800.00));
            when(cartServiceClient.getCart(any())).thenReturn(SuccessResponse.<CartServiceClient.CartDto>builder().data(cart).build());

            when(productServiceClient.getProduct(productId)).thenReturn(SuccessResponse.<ProductServiceClient.ProductDto>builder().data(null).build());

            assertThatThrownBy(() -> orderService.createOrder(userId, token, validRequest))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("Unable to verify authoritative product details for product");

            verify(orderRepository, never()).save(any());
        }

        @Test
        @DisplayName("Malformed JSON attributes fails safely closed")
        void givenMalformedJsonAttributes_whenCreateOrder_thenFailsClosed() {
            CartServiceClient.CartDto cart = buildCartWithItem(productId, 1, BigDecimal.valueOf(800.00));
            when(cartServiceClient.getCart(any())).thenReturn(SuccessResponse.<CartServiceClient.CartDto>builder().data(cart).build());

            ProductServiceClient.ProductDto product = buildValidProductDto();
            product.setAttributes("{not_valid_json: true");
            when(productServiceClient.getProduct(productId)).thenReturn(SuccessResponse.<ProductServiceClient.ProductDto>builder().data(product).build());

            assertThatThrownBy(() -> orderService.createOrder(userId, token, validRequest))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("Product metadata is invalid or corrupted");

            verify(orderRepository, never()).save(any());
        }

        @Test
        @DisplayName("Non-object JSON attributes (e.g. JSON array) fails safely closed")
        void givenNonObjectJsonAttributes_whenCreateOrder_thenFailsClosed() {
            CartServiceClient.CartDto cart = buildCartWithItem(productId, 1, BigDecimal.valueOf(800.00));
            when(cartServiceClient.getCart(any())).thenReturn(SuccessResponse.<CartServiceClient.CartDto>builder().data(cart).build());

            ProductServiceClient.ProductDto product = buildValidProductDto();
            product.setAttributes("[\"unexpected\", \"array\"]");
            when(productServiceClient.getProduct(productId)).thenReturn(SuccessResponse.<ProductServiceClient.ProductDto>builder().data(product).build());

            assertThatThrownBy(() -> orderService.createOrder(userId, token, validRequest))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("Product metadata is invalid");

            verify(orderRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("7. Cart Validation and Execution Order Guard")
    class CartValidationAndGuardOrderTests {

        @Test
        @DisplayName("Empty cart is rejected before product lookup or order creation")
        void givenEmptyCart_whenCreateOrder_thenRejected() {
            CartServiceClient.CartDto emptyCart = CartServiceClient.CartDto.builder()
                    .userId(userId)
                    .items(new ArrayList<>())
                    .subtotal(BigDecimal.ZERO)
                    .build();
            when(cartServiceClient.getCart(any())).thenReturn(SuccessResponse.<CartServiceClient.CartDto>builder().data(emptyCart).build());

            assertThatThrownBy(() -> orderService.createOrder(userId, token, validRequest))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("Cannot create order from an empty cart");

            verify(productServiceClient, never()).getProduct(any());
            verify(orderRepository, never()).save(any());
        }

        @Test
        @DisplayName("Cart item with null productId is rejected before reservation")
        void givenCartItemWithNullProductId_whenCreateOrder_thenRejected() {
            CartServiceClient.CartItemDto invalidItem = CartServiceClient.CartItemDto.builder()
                    .productId(null)
                    .quantity(1)
                    .price(BigDecimal.TEN)
                    .build();
            CartServiceClient.CartDto cart = CartServiceClient.CartDto.builder()
                    .userId(userId)
                    .items(List.of(invalidItem))
                    .subtotal(BigDecimal.TEN)
                    .build();
            when(cartServiceClient.getCart(any())).thenReturn(SuccessResponse.<CartServiceClient.CartDto>builder().data(cart).build());

            assertThatThrownBy(() -> orderService.createOrder(userId, token, validRequest))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("Cart item is malformed: missing product identifier");

            verify(orderRepository, never()).save(any());
            verify(productServiceClient, never()).updateInventory(any(), any(), any());
        }

        @Test
        @DisplayName("Cart item with non-positive quantity is rejected before reservation")
        void givenCartItemWithZeroQuantity_whenCreateOrder_thenRejected() {
            CartServiceClient.CartItemDto invalidItem = CartServiceClient.CartItemDto.builder()
                    .productId(productId)
                    .quantity(0)
                    .price(BigDecimal.TEN)
                    .build();
            CartServiceClient.CartDto cart = CartServiceClient.CartDto.builder()
                    .userId(userId)
                    .items(List.of(invalidItem))
                    .subtotal(BigDecimal.TEN)
                    .build();
            when(cartServiceClient.getCart(any())).thenReturn(SuccessResponse.<CartServiceClient.CartDto>builder().data(cart).build());

            assertThatThrownBy(() -> orderService.createOrder(userId, token, validRequest))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("Cart item quantity must be positive");

            verify(orderRepository, never()).save(any());
            verify(productServiceClient, never()).updateInventory(any(), any(), any());
        }

        @Test
        @DisplayName("Multi-item cart where the second item is a referral fails closed without reserving the first item")
        void givenMultiItemCartWithOneReferral_whenCreateOrder_thenNeitherIsReservedNorPersisted() {
            UUID product1Id = UUID.randomUUID();
            UUID product2Id = UUID.randomUUID();

            CartServiceClient.CartItemDto item1 = CartServiceClient.CartItemDto.builder()
                    .productId(product1Id)
                    .sku("ITEM-1")
                    .quantity(1)
                    .price(BigDecimal.valueOf(100.00))
                    .build();
            CartServiceClient.CartItemDto item2 = CartServiceClient.CartItemDto.builder()
                    .productId(product2Id)
                    .sku("ITEM-2")
                    .quantity(1)
                    .price(BigDecimal.valueOf(200.00))
                    .build();

            CartServiceClient.CartDto cart = CartServiceClient.CartDto.builder()
                    .userId(userId)
                    .items(List.of(item1, item2))
                    .subtotal(BigDecimal.valueOf(300.00))
                    .build();

            when(cartServiceClient.getCart(any())).thenReturn(SuccessResponse.<CartServiceClient.CartDto>builder().data(cart).build());

            ProductServiceClient.ProductDto prod1 = ProductServiceClient.ProductDto.builder()
                    .id(product1Id)
                    .sku("ITEM-1")
                    .status("ACTIVE")
                    .price(BigDecimal.valueOf(100.00))
                    .attributes("{}")
                    .build();
            ProductServiceClient.ProductDto prod2 = ProductServiceClient.ProductDto.builder()
                    .id(product2Id)
                    .sku("ITEM-2")
                    .status("ACTIVE")
                    .price(BigDecimal.valueOf(200.00))
                    .attributes("{\"destinationUrl\":\"https://external-brand.com/item\"}")
                    .build();

            when(productServiceClient.getProduct(product1Id)).thenReturn(SuccessResponse.<ProductServiceClient.ProductDto>builder().data(prod1).build());
            when(productServiceClient.getProduct(product2Id)).thenReturn(SuccessResponse.<ProductServiceClient.ProductDto>builder().data(prod2).build());

            assertThatThrownBy(() -> orderService.createOrder(userId, token, validRequest))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("External atelier referral creations cannot be ordered internally");

            // Critical assertion: NO inventory was updated for item 1 or item 2
            verify(productServiceClient, never()).updateInventory(any(), any(), any());
            verify(orderRepository, never()).save(any());
            verify(cartServiceClient, never()).clearCart(any());
            verify(eventPublisher, never()).publishOrderCreated(any());
        }
    }

    @Nested
    @DisplayName("Internal Checkout Feature Flag Tests (Fix 3)")
    class InternalCheckoutFeatureFlagTests {

        @Test
        @DisplayName("createOrder fails when internal checkout is disabled (default / false)")
        void createOrder_fails_whenInternalCheckoutDisabled() {
            ReflectionTestUtils.setField(orderService, "enableInternalCheckout", false);

            assertThatThrownBy(() -> orderService.createOrder(userId, token, validRequest))
                    .isInstanceOf(ForbiddenException.class)
                    .hasMessageContaining("Internal checkout is disabled. Direct order creation is not permitted.");

            verify(cartServiceClient, never()).getCart(any());
            verify(productServiceClient, never()).getProduct(any());
            verify(orderRepository, never()).save(any());
            verify(eventPublisher, never()).publishOrderCreated(any());
        }

        @Test
        @DisplayName("simulateStatusTransition fails when internal checkout is disabled")
        void simulateStatusTransition_fails_whenInternalCheckoutDisabled() {
            ReflectionTestUtils.setField(orderService, "enableInternalCheckout", false);

            SimulateStatusRequest req = new SimulateStatusRequest();
            req.setStatus(OrderStatus.CONFIRMED);
            req.setComment("Testing transition");

            UUID orderId = UUID.randomUUID();

            assertThatThrownBy(() -> orderService.simulateStatusTransition(userId, orderId, req))
                    .isInstanceOf(ForbiddenException.class)
                    .hasMessageContaining("Internal checkout and status simulation are disabled.");

            verify(orderRepository, never()).save(any());
            verify(statusHistoryRepository, never()).save(any());
        }

        @Test
        @DisplayName("Historical order reads remain available when internal checkout is disabled")
        void historicalOrderReads_succeed_whenInternalCheckoutDisabled() {
            ReflectionTestUtils.setField(orderService, "enableInternalCheckout", false);

            UUID orderId = UUID.randomUUID();
            Order mockOrder = Order.builder()
                    .id(orderId)
                    .userId(userId)
                    .orderNumber("ORD-HIST-001")
                    .status(OrderStatus.CONFIRMED)
                    .totalAmount(BigDecimal.valueOf(500.00))
                    .build();

            when(orderRepository.findByIdAndUserId(orderId, userId)).thenReturn(Optional.of(mockOrder));
            when(orderMapper.toResponse(mockOrder)).thenReturn(OrderResponse.builder().id(orderId).orderNumber("ORD-HIST-001").build());

            OrderResponse response = orderService.getOrder(userId, orderId);
            assertThat(response).isNotNull();
            assertThat(response.getOrderNumber()).isEqualTo("ORD-HIST-001");

            // Tracking reads
            when(statusHistoryRepository.findAllByOrderIdOrderByCreatedAtAsc(orderId)).thenReturn(List.of());
            OrderTrackingResponse tracking = orderService.getOrderTracking(userId, orderId);
            assertThat(tracking).isNotNull();
            assertThat(tracking.getOrderId()).isEqualTo(orderId);

            // User orders pagination
            PaginationDto pagination = new PaginationDto();
            pagination.setPage(0);
            pagination.setSize(10);
            Page<Order> page = new PageImpl<>(List.of(mockOrder));
            when(orderRepository.findAllByUserId(eq(userId), any(Pageable.class))).thenReturn(page);

            PageResponse<OrderResponse> pageResponse = orderService.getUserOrders(userId, pagination);
            assertThat(pageResponse).isNotNull();
            assertThat(pageResponse.getTotalElements()).isEqualTo(1);

            // Admin all orders pagination
            when(orderRepository.findAll(any(Pageable.class))).thenReturn(page);
            PageResponse<OrderResponse> allOrders = orderService.getAllOrders(pagination);
            assertThat(allOrders).isNotNull();
            assertThat(allOrders.getTotalElements()).isEqualTo(1);
        }

        @Test
        @DisplayName("Explicitly enabling internal checkout still rejects referral and inquiry items")
        void enablingInternalCheckout_stillEnforcesReferralAndInquiryRestrictions() {
            ReflectionTestUtils.setField(orderService, "enableInternalCheckout", true);

            UUID refProdId = UUID.randomUUID();
            CartServiceClient.CartItemDto item = CartServiceClient.CartItemDto.builder()
                    .productId(refProdId)
                    .name("External Atelier Coat")
                    .quantity(1)
                    .price(BigDecimal.valueOf(800.00))
                    .build();

            CartServiceClient.CartDto cart = CartServiceClient.CartDto.builder()
                    .userId(userId)
                    .items(List.of(item))
                    .subtotal(BigDecimal.valueOf(800.00))
                    .build();

            when(cartServiceClient.getCart(any())).thenReturn(SuccessResponse.<CartServiceClient.CartDto>builder().data(cart).build());

            ProductServiceClient.ProductDto referralProduct = ProductServiceClient.ProductDto.builder()
                    .id(refProdId)
                    .sku("REF-COAT-01")
                    .status("ACTIVE")
                    .price(BigDecimal.valueOf(800.00))
                    .attributes("{\"destinationUrl\":\"https://external-brand.com/coat\"}")
                    .build();

            when(productServiceClient.getProduct(refProdId)).thenReturn(SuccessResponse.<ProductServiceClient.ProductDto>builder().data(referralProduct).build());

            assertThatThrownBy(() -> orderService.createOrder(userId, token, validRequest))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("External atelier referral creations cannot be ordered internally");

            verify(orderRepository, never()).save(any());
        }
    }
}
