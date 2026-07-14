package com.ecommerce.product.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "inventory")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Inventory {

    @Id
    @Column(name = "product_id")
    private UUID productId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "product_id")
    private Product product;

    @Builder.Default
    @Column(name = "quantity_available", nullable = false)
    private int quantityAvailable = 0;

    @Builder.Default
    @Column(name = "reserved_quantity", nullable = false)
    private int reservedQuantity = 0;

    @LastModifiedDate
    @Column(name = "last_updated_at")
    private Instant lastUpdatedAt;

    @Version
    private Integer version;
}
