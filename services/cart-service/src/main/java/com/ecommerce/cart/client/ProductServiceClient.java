package com.ecommerce.cart.client;

import com.ecommerce.common.response.SuccessResponse;
import lombok.Data;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.math.BigDecimal;
import java.util.UUID;

@FeignClient(name = "product-service", url = "${app.clients.product-service.url}")
public interface ProductServiceClient {

    @GetMapping("/api/v1/products/{id}")
    SuccessResponse<ProductDto> getProduct(@PathVariable("id") UUID id);

    @GetMapping("/api/v1/products/{id}/inventory")
    SuccessResponse<InventoryDto> getInventory(@PathVariable("id") UUID id);

    @Data
    class ProductDto {
        private String name;
        private String sku;
        private BigDecimal price;
        private String imageUrl;
        private String status;
    }

    @Data
    class InventoryDto {
        private int quantityAvailable;
    }
}
