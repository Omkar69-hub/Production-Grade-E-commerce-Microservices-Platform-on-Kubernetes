package com.ecommerce.product.repository;

import com.ecommerce.product.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID> {
    
    Optional<Product> findByIdAndDeletedFalse(UUID id);
    
    boolean existsBySkuAndDeletedFalse(String sku);

    @Query("SELECT p FROM Product p WHERE p.deleted = false " +
           "AND (:categoryId IS NULL OR p.category.id = :categoryId) " +
           "AND (cast(:name as string) IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', cast(:name as string), '%')))")
    Page<Product> searchProducts(@Param("categoryId") UUID categoryId, 
                                 @Param("name") String name, 
                                 Pageable pageable);
}
