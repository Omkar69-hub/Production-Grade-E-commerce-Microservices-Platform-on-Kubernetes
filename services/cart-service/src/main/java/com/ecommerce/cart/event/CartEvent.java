package com.ecommerce.cart.event;

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
public class CartEvent implements Serializable {
    private UUID userId;
    private String action; // CREATED, UPDATED, CLEARED
    private int totalItems;
}
