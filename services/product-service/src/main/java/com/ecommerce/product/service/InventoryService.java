package com.ecommerce.product.service;

import com.ecommerce.common.exception.ResourceNotFoundException;
import com.ecommerce.product.dto.InventoryResponse;
import com.ecommerce.product.dto.InventoryUpdateRequest;
import com.ecommerce.product.entity.Inventory;
import com.ecommerce.product.event.EventPublisher;
import com.ecommerce.product.event.InventoryUpdatedEvent;
import com.ecommerce.product.mapper.ProductMapper;
import com.ecommerce.product.repository.InventoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final ProductMapper productMapper;
    private final EventPublisher eventPublisher;

    @Transactional(readOnly = true)
    public InventoryResponse getInventory(UUID productId) {
        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory not found for product ID: " + productId));
        return productMapper.toInventoryResponse(inventory);
    }

    @Transactional
    public InventoryResponse updateInventory(UUID productId, InventoryUpdateRequest request) {
        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory not found for product ID: " + productId));

        inventory.setQuantityAvailable(request.getQuantityAvailable());
        Inventory savedInventory = inventoryRepository.save(inventory);

        eventPublisher.publishInventoryUpdated(InventoryUpdatedEvent.builder()
                .productId(productId)
                .quantityAvailable(savedInventory.getQuantityAvailable())
                .reservedQuantity(savedInventory.getReservedQuantity())
                .build());

        return productMapper.toInventoryResponse(savedInventory);
    }
}
