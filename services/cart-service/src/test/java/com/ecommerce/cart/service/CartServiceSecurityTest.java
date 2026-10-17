package com.ecommerce.cart.service;

import com.ecommerce.cart.client.ProductServiceClient;
import com.ecommerce.cart.dto.CartItemRequest;
import com.ecommerce.cart.dto.CartResponse;
import com.ecommerce.cart.entity.Cart;
import com.ecommerce.cart.entity.CartItem;
import com.ecommerce.cart.event.CartEventPublisher;
import com.ecommerce.cart.mapper.CartMapper;
import com.ecommerce.cart.repository.CartRepository;
import com.ecommerce.common.exception.BusinessException;
import com.ecommerce.common.exception.ResourceNotFoundException;
import com.ecommerce.common.response.SuccessResponse;
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
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CartServiceSecurityTest {

    @Mock
    private CartRepository cartRepository;

    @Mock
    private ProductServiceClient productServiceClient;

    @Mock
    private CartMapper cartMapper;

    @Mock
    private CartEventPublisher eventPublisher;

    @Spy
    private ObjectMapper objectMapper = new ObjectMapper();

    @InjectMocks
    private CartService cartService;

    private UUID userId;
    private UUID productId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        productId = UUID.randomUUID();
        ReflectionTestUtils.setField(cartService, "cartTtlDays", 30L);
    }

    private ProductServiceClient.ProductDto buildValidProductDto() {
        return ProductServiceClient.ProductDto.builder()
                .name("Handwoven Silk Kurta")
                .sku("IND-RAWM-KUR-01")
                .price(BigDecimal.valueOf(18500.0))
                .imageUrl("https://images.unsplash.com/photo-silk-kurta")
                .status("ACTIVE")
                .attributes("{\"fabric\":\"Silk\",\"color\":\"Crimson\"}")
                .build();
    }

    private ProductServiceClient.InventoryDto buildInventoryDto(int quantity) {
        return ProductServiceClient.InventoryDto.builder()
                .quantityAvailable(quantity)
                .build();
    }

    @Nested
    @DisplayName("1. Legitimate Internal Product Operations")
    class LegitimateProductTests {

        @Test
        @DisplayName("A legitimate internal product with positive price and inventory can be added")
        void givenLegitimateInternalProduct_whenAddItem_thenSuccessfullyPersisted() {
            CartItemRequest request = CartItemRequest.builder()
                    .productId(productId)
                    .quantity(2)
                    .build();

            Cart emptyCart = Cart.builder()
                    .userId(userId)
                    .items(new ArrayList<>())
                    .build();

            when(cartRepository.findById(userId)).thenReturn(Optional.of(emptyCart));
            when(productServiceClient.getProduct(productId))
                    .thenReturn(SuccessResponse.<ProductServiceClient.ProductDto>builder()
                            .data(buildValidProductDto())
                            .build());
            when(productServiceClient.getInventory(productId))
                    .thenReturn(SuccessResponse.<ProductServiceClient.InventoryDto>builder()
                            .data(buildInventoryDto(10))
                            .build());
            when(cartMapper.toResponse(any(Cart.class))).thenReturn(CartResponse.builder().userId(userId).build());

            CartResponse response = cartService.addItemToCart(userId, request);

            assertThat(response).isNotNull();
            ArgumentCaptor<Cart> cartCaptor = ArgumentCaptor.forClass(Cart.class);
            verify(cartRepository).save(cartCaptor.capture());
            Cart saved = cartCaptor.getValue();
            assertThat(saved.getItems()).hasSize(1);
            CartItem savedItem = saved.getItems().get(0);
            assertThat(savedItem.getProductId()).isEqualTo(productId);
            assertThat(savedItem.getQuantity()).isEqualTo(2);
            assertThat(savedItem.getPrice()).isEqualByComparingTo(BigDecimal.valueOf(18500.0));
            assertThat(savedItem.getSku()).isEqualTo("IND-RAWM-KUR-01");
            verify(eventPublisher).publishCartUpdated(eq(userId), eq(2));
        }

        @Test
        @DisplayName("Product with null or empty attributes is treated as valid internal product")
        void givenProductWithNullAttributes_whenAddItem_thenAllowed() {
            CartItemRequest request = CartItemRequest.builder()
                    .productId(productId)
                    .quantity(1)
                    .build();

            Cart emptyCart = Cart.builder()
                    .userId(userId)
                    .items(new ArrayList<>())
                    .build();

            ProductServiceClient.ProductDto product = buildValidProductDto();
            product.setAttributes(null);

            when(cartRepository.findById(userId)).thenReturn(Optional.of(emptyCart));
            when(productServiceClient.getProduct(productId))
                    .thenReturn(SuccessResponse.<ProductServiceClient.ProductDto>builder()
                            .data(product)
                            .build());
            when(productServiceClient.getInventory(productId))
                    .thenReturn(SuccessResponse.<ProductServiceClient.InventoryDto>builder()
                            .data(buildInventoryDto(5))
                            .build());
            when(cartMapper.toResponse(any(Cart.class))).thenReturn(CartResponse.builder().userId(userId).build());

            cartService.addItemToCart(userId, request);

            verify(cartRepository).save(any(Cart.class));
        }
    }

    @Nested
    @DisplayName("2. Reject Products with Destination URL")
    class DestinationUrlTests {

        @Test
        @DisplayName("Product with non-empty destinationUrl is rejected from addItemToCart")
        void givenProductWithDestinationUrl_whenAddItem_thenRejected() {
            CartItemRequest request = CartItemRequest.builder()
                    .productId(productId)
                    .quantity(1)
                    .build();

            ProductServiceClient.ProductDto referralProduct = buildValidProductDto();
            referralProduct.setAttributes("{\"destinationUrl\":\"https://www.sabyasachi.com/collection/heritage-bridal/\"}");

            when(cartRepository.findById(userId)).thenReturn(Optional.of(Cart.builder().userId(userId).items(new ArrayList<>()).build()));
            when(productServiceClient.getProduct(productId))
                    .thenReturn(SuccessResponse.<ProductServiceClient.ProductDto>builder()
                            .data(referralProduct)
                            .build());

            assertThatThrownBy(() -> cartService.addItemToCart(userId, request))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("External atelier referral creations must be acquired via the brand's official portal");

            verify(cartRepository, never()).save(any());
            verify(eventPublisher, never()).publishCartUpdated(any(), anyInt());
        }

        @Test
        @DisplayName("Product with destinationType is rejected as referral creation")
        void givenProductWithDestinationType_whenAddItem_thenRejected() {
            CartItemRequest request = CartItemRequest.builder()
                    .productId(productId)
                    .quantity(1)
                    .build();

            ProductServiceClient.ProductDto referralProduct = buildValidProductDto();
            referralProduct.setAttributes("{\"destinationType\":\"OFFICIAL_CATEGORY_DESTINATION\"}");

            when(cartRepository.findById(userId)).thenReturn(Optional.of(Cart.builder().userId(userId).items(new ArrayList<>()).build()));
            when(productServiceClient.getProduct(productId))
                    .thenReturn(SuccessResponse.<ProductServiceClient.ProductDto>builder()
                            .data(referralProduct)
                            .build());

            assertThatThrownBy(() -> cartService.addItemToCart(userId, request))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("External atelier referral creations must be acquired via the brand's official portal");

            verify(cartRepository, never()).save(any());
        }

        @Test
        @DisplayName("Product with REFERRAL_LINK fulfillmentType is rejected from internal bag")
        void givenProductWithReferralLinkFulfillment_whenAddItem_thenRejected() {
            CartItemRequest request = CartItemRequest.builder()
                    .productId(productId)
                    .quantity(1)
                    .build();

            ProductServiceClient.ProductDto referralProduct = buildValidProductDto();
            referralProduct.setAttributes("{\"fulfillmentType\":\"REFERRAL_LINK\"}");

            when(cartRepository.findById(userId)).thenReturn(Optional.of(Cart.builder().userId(userId).items(new ArrayList<>()).build()));
            when(productServiceClient.getProduct(productId))
                    .thenReturn(SuccessResponse.<ProductServiceClient.ProductDto>builder()
                            .data(referralProduct)
                            .build());

            assertThatThrownBy(() -> cartService.addItemToCart(userId, request))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("External atelier referral creations cannot be added to the internal bag");

            verify(cartRepository, never()).save(any());
        }

        @Test
        @DisplayName("Product with unknown fulfillmentType is rejected fail-closed")
        void givenProductWithUnknownFulfillment_whenAddItem_thenRejected() {
            CartItemRequest request = CartItemRequest.builder()
                    .productId(productId)
                    .quantity(1)
                    .build();

            ProductServiceClient.ProductDto unknownProduct = buildValidProductDto();
            unknownProduct.setAttributes("{\"fulfillmentType\":\"DROPSHIP\"}");

            when(cartRepository.findById(userId)).thenReturn(Optional.of(Cart.builder().userId(userId).items(new ArrayList<>()).build()));
            when(productServiceClient.getProduct(productId))
                    .thenReturn(SuccessResponse.<ProductServiceClient.ProductDto>builder()
                            .data(unknownProduct)
                            .build());

            assertThatThrownBy(() -> cartService.addItemToCart(userId, request))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("Unknown or unsupported fulfillment type");

            verify(cartRepository, never()).save(any());
        }

        @Test
        @DisplayName("Product with isReferral true is rejected from internal bag")
        void givenProductWithIsReferralTrue_whenAddItem_thenRejected() {
            CartItemRequest request = CartItemRequest.builder()
                    .productId(productId)
                    .quantity(1)
                    .build();

            ProductServiceClient.ProductDto refProduct = buildValidProductDto();
            refProduct.setAttributes("{\"isReferral\":true}");

            when(cartRepository.findById(userId)).thenReturn(Optional.of(Cart.builder().userId(userId).items(new ArrayList<>()).build()));
            when(productServiceClient.getProduct(productId))
                    .thenReturn(SuccessResponse.<ProductServiceClient.ProductDto>builder()
                            .data(refProduct)
                            .build());

            assertThatThrownBy(() -> cartService.addItemToCart(userId, request))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("External atelier referral creations cannot be added to the internal bag");

            verify(cartRepository, never()).save(any());
        }

        @Test
        @DisplayName("Product with isEditorialConcept true is rejected from internal bag")
        void givenProductWithIsEditorialConceptTrue_whenAddItem_thenRejected() {
            CartItemRequest request = CartItemRequest.builder()
                    .productId(productId)
                    .quantity(1)
                    .build();

            ProductServiceClient.ProductDto editorialProduct = buildValidProductDto();
            editorialProduct.setAttributes("{\"isEditorialConcept\":true}");

            when(cartRepository.findById(userId)).thenReturn(Optional.of(Cart.builder().userId(userId).items(new ArrayList<>()).build()));
            when(productServiceClient.getProduct(productId))
                    .thenReturn(SuccessResponse.<ProductServiceClient.ProductDto>builder()
                            .data(editorialProduct)
                            .build());

            assertThatThrownBy(() -> cartService.addItemToCart(userId, request))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("Editorial concepts cannot be added to the internal bag");

            verify(cartRepository, never()).save(any());
        }

        @Test
        @DisplayName("Product with INTERNAL fulfillmentType and positive price succeeds")
        void givenProductWithInternalFulfillment_whenAddItem_thenSucceeds() {
            CartItemRequest request = CartItemRequest.builder()
                    .productId(productId)
                    .quantity(1)
                    .build();

            ProductServiceClient.ProductDto internalProduct = buildValidProductDto();
            internalProduct.setAttributes("{\"fulfillmentType\":\"INTERNAL\",\"fabric\":\"Silk\"}");

            when(cartRepository.findById(userId)).thenReturn(Optional.of(Cart.builder().userId(userId).items(new ArrayList<>()).build()));
            when(productServiceClient.getProduct(productId))
                    .thenReturn(SuccessResponse.<ProductServiceClient.ProductDto>builder()
                            .data(internalProduct)
                            .build());
            when(productServiceClient.getInventory(productId))
                    .thenReturn(SuccessResponse.<ProductServiceClient.InventoryDto>builder()
                            .data(buildInventoryDto(5))
                            .build());
            when(cartMapper.toResponse(any(Cart.class))).thenReturn(CartResponse.builder().userId(userId).build());

            cartService.addItemToCart(userId, request);

            verify(cartRepository).save(any(Cart.class));
        }
    }

    @Nested
    @DisplayName("3. Reject Products with Price Upon Inquiry")
    class PriceUponInquiryTests {

        @Test
        @DisplayName("Product marked PRICE_UPON_INQUIRY is rejected from internal cart")
        void givenProductWithPriceUponInquiry_whenAddItem_thenRejected() {
            CartItemRequest request = CartItemRequest.builder()
                    .productId(productId)
                    .quantity(1)
                    .build();

            ProductServiceClient.ProductDto inquiryProduct = buildValidProductDto();
            inquiryProduct.setAttributes("{\"priceVerificationStatus\":\"PRICE_UPON_INQUIRY\"}");

            when(cartRepository.findById(userId)).thenReturn(Optional.of(Cart.builder().userId(userId).items(new ArrayList<>()).build()));
            when(productServiceClient.getProduct(productId))
                    .thenReturn(SuccessResponse.<ProductServiceClient.ProductDto>builder()
                            .data(inquiryProduct)
                            .build());

            assertThatThrownBy(() -> cartService.addItemToCart(userId, request))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("Creations priced upon atelier inquiry cannot be added to the internal bag");

            verify(cartRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("4. Reject Zero-Priced Products")
    class ZeroPriceTests {

        @Test
        @DisplayName("Product with zero price is rejected from internal cart")
        void givenZeroPricedProduct_whenAddItem_thenRejected() {
            CartItemRequest request = CartItemRequest.builder()
                    .productId(productId)
                    .quantity(1)
                    .build();

            ProductServiceClient.ProductDto zeroPriceProduct = buildValidProductDto();
            zeroPriceProduct.setPrice(BigDecimal.ZERO);

            when(cartRepository.findById(userId)).thenReturn(Optional.of(Cart.builder().userId(userId).items(new ArrayList<>()).build()));
            when(productServiceClient.getProduct(productId))
                    .thenReturn(SuccessResponse.<ProductServiceClient.ProductDto>builder()
                            .data(zeroPriceProduct)
                            .build());

            assertThatThrownBy(() -> cartService.addItemToCart(userId, request))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("Items with zero, negative, or unverified pricing cannot be added to the bag");

            verify(cartRepository, never()).save(any());
        }

        @Test
        @DisplayName("Product with null price is rejected from internal cart")
        void givenNullPricedProduct_whenAddItem_thenRejected() {
            CartItemRequest request = CartItemRequest.builder()
                    .productId(productId)
                    .quantity(1)
                    .build();

            ProductServiceClient.ProductDto nullPriceProduct = buildValidProductDto();
            nullPriceProduct.setPrice(null);

            when(cartRepository.findById(userId)).thenReturn(Optional.of(Cart.builder().userId(userId).items(new ArrayList<>()).build()));
            when(productServiceClient.getProduct(productId))
                    .thenReturn(SuccessResponse.<ProductServiceClient.ProductDto>builder()
                            .data(nullPriceProduct)
                            .build());

            assertThatThrownBy(() -> cartService.addItemToCart(userId, request))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("Items with zero, negative, or unverified pricing cannot be added to the bag");

            verify(cartRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("5. Reject Negative-Priced Products")
    class NegativePriceTests {

        @Test
        @DisplayName("Product with negative price is rejected from internal cart")
        void givenNegativePricedProduct_whenAddItem_thenRejected() {
            CartItemRequest request = CartItemRequest.builder()
                    .productId(productId)
                    .quantity(1)
                    .build();

            ProductServiceClient.ProductDto negativePriceProduct = buildValidProductDto();
            negativePriceProduct.setPrice(BigDecimal.valueOf(-199.99));

            when(cartRepository.findById(userId)).thenReturn(Optional.of(Cart.builder().userId(userId).items(new ArrayList<>()).build()));
            when(productServiceClient.getProduct(productId))
                    .thenReturn(SuccessResponse.<ProductServiceClient.ProductDto>builder()
                            .data(negativePriceProduct)
                            .build());

            assertThatThrownBy(() -> cartService.addItemToCart(userId, request))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("Items with zero, negative, or unverified pricing cannot be added to the bag");

            verify(cartRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("6. Missing or Malformed Product Data Fails Safely")
    class MalformedDataTests {

        @Test
        @DisplayName("Downstream product-service failure fails safely")
        void givenProductServiceFailure_whenAddItem_thenThrowsBusinessException() {
            CartItemRequest request = CartItemRequest.builder()
                    .productId(productId)
                    .quantity(1)
                    .build();

            when(cartRepository.findById(userId)).thenReturn(Optional.of(Cart.builder().userId(userId).items(new ArrayList<>()).build()));
            when(productServiceClient.getProduct(productId)).thenThrow(new RuntimeException("Product service 503 unavailable"));

            assertThatThrownBy(() -> cartService.addItemToCart(userId, request))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("Unable to fetch product details at this time");

            verify(cartRepository, never()).save(any());
        }

        @Test
        @DisplayName("Malformed JSON attributes fails safely without corrupting cart")
        void givenMalformedAttributes_whenAddItem_thenFailsSafely() {
            CartItemRequest request = CartItemRequest.builder()
                    .productId(productId)
                    .quantity(1)
                    .build();

            ProductServiceClient.ProductDto malformedProduct = buildValidProductDto();
            malformedProduct.setAttributes("{not_valid_json: 123");

            when(cartRepository.findById(userId)).thenReturn(Optional.of(Cart.builder().userId(userId).items(new ArrayList<>()).build()));
            when(productServiceClient.getProduct(productId))
                    .thenReturn(SuccessResponse.<ProductServiceClient.ProductDto>builder()
                            .data(malformedProduct)
                            .build());

            assertThatThrownBy(() -> cartService.addItemToCart(userId, request))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("Product metadata is invalid or corrupted");

            verify(cartRepository, never()).save(any());
        }

        @Test
        @DisplayName("Inactive product status fails safely")
        void givenInactiveProduct_whenAddItem_thenRejected() {
            CartItemRequest request = CartItemRequest.builder()
                    .productId(productId)
                    .quantity(1)
                    .build();

            ProductServiceClient.ProductDto inactiveProduct = buildValidProductDto();
            inactiveProduct.setStatus("INACTIVE");

            when(cartRepository.findById(userId)).thenReturn(Optional.of(Cart.builder().userId(userId).items(new ArrayList<>()).build()));
            when(productServiceClient.getProduct(productId))
                    .thenReturn(SuccessResponse.<ProductServiceClient.ProductDto>builder()
                            .data(inactiveProduct)
                            .build());

            assertThatThrownBy(() -> cartService.addItemToCart(userId, request))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("Product is not available for purchase");

            verify(cartRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("7. Inventory-Service Failure Fails Safely")
    class InventoryFailureTests {

        @Test
        @DisplayName("Inventory service exception prevents cart mutation")
        void givenInventoryServiceFailure_whenAddItem_thenFailsSafelyAndDoesNotPersist() {
            CartItemRequest request = CartItemRequest.builder()
                    .productId(productId)
                    .quantity(1)
                    .build();

            when(cartRepository.findById(userId)).thenReturn(Optional.of(Cart.builder().userId(userId).items(new ArrayList<>()).build()));
            when(productServiceClient.getProduct(productId))
                    .thenReturn(SuccessResponse.<ProductServiceClient.ProductDto>builder()
                            .data(buildValidProductDto())
                            .build());
            when(productServiceClient.getInventory(productId))
                    .thenThrow(new RuntimeException("Inventory timeout"));

            assertThatThrownBy(() -> cartService.addItemToCart(userId, request))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("Unable to verify product inventory at this time");

            verify(cartRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("8. Insufficient Stock Behavior Preserved")
    class InsufficientStockTests {

        @Test
        @DisplayName("Requested quantity exceeding stock throws BusinessException and does not persist")
        void givenInsufficientStock_whenAddItem_thenThrowsBusinessException() {
            CartItemRequest request = CartItemRequest.builder()
                    .productId(productId)
                    .quantity(5)
                    .build();

            when(cartRepository.findById(userId)).thenReturn(Optional.of(Cart.builder().userId(userId).items(new ArrayList<>()).build()));
            when(productServiceClient.getProduct(productId))
                    .thenReturn(SuccessResponse.<ProductServiceClient.ProductDto>builder()
                            .data(buildValidProductDto())
                            .build());
            when(productServiceClient.getInventory(productId))
                    .thenReturn(SuccessResponse.<ProductServiceClient.InventoryDto>builder()
                            .data(buildInventoryDto(2))
                            .build());

            assertThatThrownBy(() -> cartService.addItemToCart(userId, request))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("Requested quantity exceeds available stock. Available: 2");

            verify(cartRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("9. Quantity Updates Cannot Bypass Referral or Price Protection")
    class QuantityUpdateTests {

        @Test
        @DisplayName("Quantity update on referral product is rejected and does not mutate cart")
        void givenReferralProduct_whenUpdateItemQuantity_thenRejected() {
            CartItem existingItem = CartItem.builder()
                    .productId(productId)
                    .quantity(1)
                    .price(BigDecimal.valueOf(18500.0))
                    .sku("IND-RAWM-KUR-01")
                    .name("Silk Kurta")
                    .build();

            Cart cart = Cart.builder()
                    .userId(userId)
                    .items(new ArrayList<>(java.util.List.of(existingItem)))
                    .build();

            CartItemRequest updateRequest = CartItemRequest.builder()
                    .productId(productId)
                    .quantity(3)
                    .build();

            ProductServiceClient.ProductDto nowReferralProduct = buildValidProductDto();
            nowReferralProduct.setAttributes("{\"destinationUrl\":\"https://www.rawmango.com/kurtas/\"}");

            when(cartRepository.findById(userId)).thenReturn(Optional.of(cart));
            when(productServiceClient.getProduct(productId))
                    .thenReturn(SuccessResponse.<ProductServiceClient.ProductDto>builder()
                            .data(nowReferralProduct)
                            .build());

            assertThatThrownBy(() -> cartService.updateItemQuantity(userId, productId, updateRequest))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("External atelier referral creations must be acquired via the brand's official portal");

            // Cart item quantity unchanged
            assertThat(existingItem.getQuantity()).isEqualTo(1);
            verify(cartRepository, never()).save(any());
        }

        @Test
        @DisplayName("Quantity update on zero-priced product is rejected and does not mutate cart")
        void givenZeroPriceProduct_whenUpdateItemQuantity_thenRejected() {
            CartItem existingItem = CartItem.builder()
                    .productId(productId)
                    .quantity(1)
                    .price(BigDecimal.valueOf(18500.0))
                    .sku("IND-RAWM-KUR-01")
                    .name("Silk Kurta")
                    .build();

            Cart cart = Cart.builder()
                    .userId(userId)
                    .items(new ArrayList<>(java.util.List.of(existingItem)))
                    .build();

            CartItemRequest updateRequest = CartItemRequest.builder()
                    .productId(productId)
                    .quantity(2)
                    .build();

            ProductServiceClient.ProductDto zeroPriceProduct = buildValidProductDto();
            zeroPriceProduct.setPrice(BigDecimal.ZERO);

            when(cartRepository.findById(userId)).thenReturn(Optional.of(cart));
            when(productServiceClient.getProduct(productId))
                    .thenReturn(SuccessResponse.<ProductServiceClient.ProductDto>builder()
                            .data(zeroPriceProduct)
                            .build());

            assertThatThrownBy(() -> cartService.updateItemQuantity(userId, productId, updateRequest))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("Items with zero, negative, or unverified pricing cannot be added to the bag");

            assertThat(existingItem.getQuantity()).isEqualTo(1);
            verify(cartRepository, never()).save(any());
        }

        @Test
        @DisplayName("Quantity update with mismatched productId in request body throws BusinessException")
        void givenMismatchedProductId_whenUpdateItemQuantity_thenThrowsBusinessException() {
            CartItemRequest mismatchedRequest = CartItemRequest.builder()
                    .productId(UUID.randomUUID())
                    .quantity(2)
                    .build();

            assertThatThrownBy(() -> cartService.updateItemQuantity(userId, productId, mismatchedRequest))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("Product ID in path must match request body");

            verify(cartRepository, never()).save(any());
        }

        @Test
        @DisplayName("Valid quantity update on legitimate product refreshes price and updates quantity")
        void givenValidInternalProduct_whenUpdateItemQuantity_thenSucceedsAndUpdatesPrice() {
            CartItem existingItem = CartItem.builder()
                    .productId(productId)
                    .quantity(1)
                    .price(BigDecimal.valueOf(15000.0)) // old price
                    .sku("IND-RAWM-KUR-01")
                    .name("Silk Kurta")
                    .build();

            Cart cart = Cart.builder()
                    .userId(userId)
                    .items(new ArrayList<>(java.util.List.of(existingItem)))
                    .build();

            CartItemRequest updateRequest = CartItemRequest.builder()
                    .productId(productId)
                    .quantity(3)
                    .build();

            ProductServiceClient.ProductDto latestProduct = buildValidProductDto();
            latestProduct.setPrice(BigDecimal.valueOf(18500.0)); // updated authoritative price

            when(cartRepository.findById(userId)).thenReturn(Optional.of(cart));
            when(productServiceClient.getProduct(productId))
                    .thenReturn(SuccessResponse.<ProductServiceClient.ProductDto>builder()
                            .data(latestProduct)
                            .build());
            when(productServiceClient.getInventory(productId))
                    .thenReturn(SuccessResponse.<ProductServiceClient.InventoryDto>builder()
                            .data(buildInventoryDto(10))
                            .build());
            when(cartMapper.toResponse(any(Cart.class))).thenReturn(CartResponse.builder().userId(userId).build());

            cartService.updateItemQuantity(userId, productId, updateRequest);

            assertThat(existingItem.getQuantity()).isEqualTo(3);
            assertThat(existingItem.getPrice()).isEqualByComparingTo(BigDecimal.valueOf(18500.0));
            verify(cartRepository).save(cart);
            verify(eventPublisher).publishCartUpdated(eq(userId), eq(3));
        }
    }

    @Nested
    @DisplayName("10. State Integrity and Non-Persistence on Failure")
    class StateIntegrityTests {

        @Test
        @DisplayName("Failed add request never appends unsafe item to existing cart")
        void givenCartWithExistingItems_whenAddReferralItemFails_thenCartItemsUnchanged() {
            UUID existingProductId = UUID.randomUUID();
            CartItem existingItem = CartItem.builder()
                    .productId(existingProductId)
                    .quantity(1)
                    .price(BigDecimal.valueOf(5000.0))
                    .sku("LEGI-01")
                    .name("Legit Shirt")
                    .build();

            Cart cart = Cart.builder()
                    .userId(userId)
                    .items(new ArrayList<>(java.util.List.of(existingItem)))
                    .build();

            CartItemRequest unsafeRequest = CartItemRequest.builder()
                    .productId(productId)
                    .quantity(1)
                    .build();

            ProductServiceClient.ProductDto referral = buildValidProductDto();
            referral.setAttributes("{\"destinationUrl\":\"https://www.anitadongre.com/sarees/\"}");

            when(cartRepository.findById(userId)).thenReturn(Optional.of(cart));
            when(productServiceClient.getProduct(productId))
                    .thenReturn(SuccessResponse.<ProductServiceClient.ProductDto>builder()
                            .data(referral)
                            .build());

            assertThatThrownBy(() -> cartService.addItemToCart(userId, unsafeRequest))
                    .isInstanceOf(BusinessException.class);

            // Existing cart must still only have the 1 original item
            assertThat(cart.getItems()).hasSize(1);
            assertThat(cart.getItems().get(0).getProductId()).isEqualTo(existingProductId);
            verify(cartRepository, never()).save(any());
        }

        @Test
        @DisplayName("Item not found in cart throws ResourceNotFoundException on update")
        void givenMissingCartItem_whenUpdateItemQuantity_thenThrowsResourceNotFoundException() {
            Cart cart = Cart.builder()
                    .userId(userId)
                    .items(new ArrayList<>())
                    .build();

            CartItemRequest request = CartItemRequest.builder()
                    .productId(productId)
                    .quantity(1)
                    .build();

            when(cartRepository.findById(userId)).thenReturn(Optional.of(cart));

            assertThatThrownBy(() -> cartService.updateItemQuantity(userId, productId, request))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("Item not found in cart");

            verify(cartRepository, never()).save(any());
        }
    }
}
