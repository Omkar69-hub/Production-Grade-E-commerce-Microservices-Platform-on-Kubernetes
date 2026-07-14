package com.ecommerce.product.controller;

import com.ecommerce.common.dto.PaginationDto;
import com.ecommerce.common.response.PageResponse;
import com.ecommerce.common.response.SuccessResponse;
import com.ecommerce.product.dto.ProductRequest;
import com.ecommerce.product.dto.ProductResponse;
import com.ecommerce.product.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<SuccessResponse<PageResponse<ProductResponse>>> searchProducts(
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(required = false) String name,
            @Valid PaginationDto pagination) {
        
        PageResponse<ProductResponse> response = productService.searchProducts(categoryId, name, pagination);
        
        return ResponseEntity.ok(SuccessResponse.<PageResponse<ProductResponse>>builder()
                .data(response)
                .message("Products retrieved successfully")
                .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SuccessResponse<ProductResponse>> getProduct(@PathVariable UUID id) {
        ProductResponse response = productService.getProduct(id);
        return ResponseEntity.ok(SuccessResponse.<ProductResponse>builder()
                .data(response)
                .message("Product retrieved successfully")
                .build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SuccessResponse<ProductResponse>> createProduct(@Valid @RequestBody ProductRequest request) {
        ProductResponse response = productService.createProduct(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(SuccessResponse.<ProductResponse>builder()
                        .data(response)
                        .message("Product created successfully")
                        .build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SuccessResponse<ProductResponse>> updateProduct(@PathVariable UUID id, @Valid @RequestBody ProductRequest request) {
        ProductResponse response = productService.updateProduct(id, request);
        return ResponseEntity.ok(SuccessResponse.<ProductResponse>builder()
                .data(response)
                .message("Product updated successfully")
                .build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SuccessResponse<Void>> deleteProduct(@PathVariable UUID id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(SuccessResponse.<Void>builder()
                .message("Product deleted successfully")
                .build());
    }
}
