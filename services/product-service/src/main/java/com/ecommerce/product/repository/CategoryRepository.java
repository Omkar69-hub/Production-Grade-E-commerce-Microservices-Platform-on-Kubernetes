package com.ecommerce.product.repository;

import com.ecommerce.product.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CategoryRepository extends JpaRepository<Category, UUID> {
    Optional<Category> findByIdAndDeletedFalse(UUID id);
    List<Category> findAllByDeletedFalse();

    @org.springframework.data.jpa.repository.Query("SELECT c FROM Category c WHERE c.deleted = false AND LOWER(c.name) NOT LIKE '%electronic%'")
    List<Category> findStorefrontCategories();

    boolean existsByNameAndDeletedFalse(String name);
}
