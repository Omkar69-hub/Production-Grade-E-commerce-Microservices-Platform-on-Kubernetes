package com.ecommerce.order.client;

import com.ecommerce.common.response.SuccessResponse;
import lombok.Data;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@FeignClient(name = "cart-service", url = "${app.clients.cart-service.url}")
public interface CartServiceClient {

    @GetMapping("/api/v1/cart")
    SuccessResponse<CartDto> getCart(@RequestHeader("Authorization") String token);

    @DeleteMapping("/api/v1/cart")
    SuccessResponse<Void> clearCart(@RequestHeader("Authorization") String token);

    @Data
    class CartDto {
        private UUID userId;
        private List<CartItemDto> items;
        private BigDecimal subtotal;
    }

    @Data
    class CartItemDto {
        private UUID productId;
        private String sku;
        private String name;
        private int quantity;
        private BigDecimal price;
        private BigDecimal totalLinePrice;
    }
}
