package com.ecommerce.product.controller;

import com.ecommerce.common.response.SuccessResponse;
import com.ecommerce.product.dto.CategoryRequest;
import com.ecommerce.product.dto.CategoryResponse;
import com.ecommerce.product.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<SuccessResponse<List<CategoryResponse>>> getAllCategories() {
        return ResponseEntity.ok(SuccessResponse.<List<CategoryResponse>>builder()
                .data(categoryService.getAllCategories())
                .message("Categories retrieved successfully")
                .build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SuccessResponse<CategoryResponse>> createCategory(@Valid @RequestBody CategoryRequest request) {
        CategoryResponse response = categoryService.createCategory(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(SuccessResponse.<CategoryResponse>builder()
                        .data(response)
                        .message("Category created successfully")
                        .build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SuccessResponse<CategoryResponse>> updateCategory(@PathVariable UUID id, @Valid @RequestBody CategoryRequest request) {
        CategoryResponse response = categoryService.updateCategory(id, request);
        return ResponseEntity.ok(SuccessResponse.<CategoryResponse>builder()
                .data(response)
                .message("Category updated successfully")
                .build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SuccessResponse<Void>> deleteCategory(@PathVariable UUID id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok(SuccessResponse.<Void>builder()
                .message("Category deleted successfully")
                .build());
    }
}
