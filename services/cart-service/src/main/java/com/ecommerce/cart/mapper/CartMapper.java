package com.ecommerce.cart.mapper;

import com.ecommerce.cart.dto.CartItemResponse;
import com.ecommerce.cart.dto.CartResponse;
import com.ecommerce.cart.dto.CartSummaryResponse;
import com.ecommerce.cart.entity.Cart;
import com.ecommerce.cart.entity.CartItem;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class CartMapper {

    public CartResponse toResponse(Cart cart) {
        if (cart == null) return null;

        List<CartItemResponse> items = cart.getItems().stream()
                .map(this::toItemResponse)
                .collect(Collectors.toList());

        BigDecimal subtotal = items.stream()
                .map(CartItemResponse::getTotalLinePrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return CartResponse.builder()
                .userId(cart.getUserId())
                .items(items)
                .subtotal(subtotal)
                .build();
    }

    public CartSummaryResponse toSummaryResponse(Cart cart) {
        if (cart == null) return null;

        int totalItems = cart.getItems().stream().mapToInt(CartItem::getQuantity).sum();
        
        BigDecimal subtotal = cart.getItems().stream()
                .map(item -> item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return CartSummaryResponse.builder()
                .userId(cart.getUserId())
                .totalItems(totalItems)
                .subtotal(subtotal)
                .build();
    }

    private CartItemResponse toItemResponse(CartItem item) {
        return CartItemResponse.builder()
                .productId(item.getProductId())
                .sku(item.getSku())
                .name(item.getName())
                .quantity(item.getQuantity())
                .price(item.getPrice())
                .imageUrl(item.getImageUrl())
                .totalLinePrice(item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .build();
    }
}
