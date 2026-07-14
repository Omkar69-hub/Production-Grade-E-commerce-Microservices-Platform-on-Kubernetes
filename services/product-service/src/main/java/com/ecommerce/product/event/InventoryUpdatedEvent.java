package com.ecommerce.product.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryUpdatedEvent implements Serializable {
    private UUID productId;
    private int quantityAvailable;
    private int reservedQuantity;
}
