package com.ecommerce.product.controller;

import com.ecommerce.common.response.SuccessResponse;
import com.ecommerce.product.dto.InventoryResponse;
import com.ecommerce.product.dto.InventoryUpdateRequest;
import com.ecommerce.product.service.InventoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/products/{id}/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping
    public ResponseEntity<SuccessResponse<InventoryResponse>> getInventory(@PathVariable UUID id) {
        InventoryResponse response = inventoryService.getInventory(id);
        return ResponseEntity.ok(SuccessResponse.<InventoryResponse>builder()
                .data(response)
                .message("Inventory retrieved successfully")
                .build());
    }

    @PutMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SuccessResponse<InventoryResponse>> updateInventory(
            @PathVariable UUID id,
            @Valid @RequestBody InventoryUpdateRequest request) {
        InventoryResponse response = inventoryService.updateInventory(id, request);
        return ResponseEntity.ok(SuccessResponse.<InventoryResponse>builder()
                .data(response)
                .message("Inventory updated successfully")
                .build());
    }
}
