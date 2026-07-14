package com.ecommerce.cart.controller;

import com.ecommerce.cart.dto.CartItemRequest;
import com.ecommerce.cart.dto.CartResponse;
import com.ecommerce.cart.dto.CartSummaryResponse;
import com.ecommerce.cart.service.CartService;
import com.ecommerce.common.exception.UnauthorizedException;
import com.ecommerce.common.response.SuccessResponse;
import com.ecommerce.common.util.SecurityUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<SuccessResponse<CartResponse>> getCart() {
        UUID userId = getCurrentUserId();
        return ResponseEntity.ok(SuccessResponse.<CartResponse>builder()
                .data(cartService.getCart(userId))
                .message("Cart retrieved successfully")
                .build());
    }

    @GetMapping("/summary")
    public ResponseEntity<SuccessResponse<CartSummaryResponse>> getCartSummary() {
        UUID userId = getCurrentUserId();
        return ResponseEntity.ok(SuccessResponse.<CartSummaryResponse>builder()
                .data(cartService.getCartSummary(userId))
                .message("Cart summary retrieved successfully")
                .build());
    }

    @PostMapping("/items")
    public ResponseEntity<SuccessResponse<CartResponse>> addItemToCart(@Valid @RequestBody CartItemRequest request) {
        UUID userId = getCurrentUserId();
        return ResponseEntity.ok(SuccessResponse.<CartResponse>builder()
                .data(cartService.addItemToCart(userId, request))
                .message("Item added to cart successfully")
                .build());
    }

    @PutMapping("/items/{itemId}")
    public ResponseEntity<SuccessResponse<CartResponse>> updateItemQuantity(
            @PathVariable UUID itemId, 
            @Valid @RequestBody CartItemRequest request) {
        UUID userId = getCurrentUserId();
        return ResponseEntity.ok(SuccessResponse.<CartResponse>builder()
                .data(cartService.updateItemQuantity(userId, itemId, request))
                .message("Cart updated successfully")
                .build());
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<SuccessResponse<CartResponse>> removeItem(@PathVariable UUID itemId) {
        UUID userId = getCurrentUserId();
        return ResponseEntity.ok(SuccessResponse.<CartResponse>builder()
                .data(cartService.removeItem(userId, itemId))
                .message("Item removed successfully")
                .build());
    }

    @DeleteMapping
    public ResponseEntity<SuccessResponse<Void>> clearCart() {
        UUID userId = getCurrentUserId();
        cartService.clearCart(userId);
        return ResponseEntity.ok(SuccessResponse.<Void>builder()
                .message("Cart cleared successfully")
                .build());
    }

    private UUID getCurrentUserId() {
        return UUID.fromString(SecurityUtil.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("User must be authenticated to access cart")));
    }
}
