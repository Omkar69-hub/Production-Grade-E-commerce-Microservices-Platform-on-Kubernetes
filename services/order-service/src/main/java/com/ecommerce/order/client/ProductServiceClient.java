package com.ecommerce.order.client;

import com.ecommerce.common.response.SuccessResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.UUID;

@FeignClient(name = "product-service", url = "${app.clients.product-service.url}")
public interface ProductServiceClient {

    @GetMapping("/api/v1/products/{id}")
    SuccessResponse<ProductDto> getProduct(@PathVariable("id") UUID id);

    @GetMapping("/api/v1/products/{id}/inventory")
    SuccessResponse<InventoryDto> getInventory(@PathVariable("id") UUID id);

    @PutMapping("/api/v1/products/{id}/inventory")
    SuccessResponse<InventoryDto> updateInventory(@RequestHeader("Authorization") String token,
                                                  @PathVariable("id") UUID id,
                                                  @RequestBody InventoryUpdateRequest request);

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    class ProductDto {
        private UUID id;
        private String name;
        private String sku;
        private BigDecimal price;
        private String imageUrl;
        private String status;
        private String attributes;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    class InventoryDto {
        private UUID productId;
        private int quantityAvailable;
        private int reservedQuantity;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    class InventoryUpdateRequest {
        private Integer quantityAvailable;
    }
}
