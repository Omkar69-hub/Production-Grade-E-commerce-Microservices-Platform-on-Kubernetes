package com.ecommerce.product.repository;

import com.ecommerce.product.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CategoryRepository extends JpaRepository<Category, UUID> {
    Optional<Category> findByIdAndIsDeletedFalse(UUID id);
    List<Category> findAllByIsDeletedFalse();
    boolean existsByNameAndIsDeletedFalse(String name);
}
