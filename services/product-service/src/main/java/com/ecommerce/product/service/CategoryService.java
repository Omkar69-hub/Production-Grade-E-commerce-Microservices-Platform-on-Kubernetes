package com.ecommerce.product.service;

import com.ecommerce.common.exception.ConflictException;
import com.ecommerce.common.exception.ResourceNotFoundException;
import com.ecommerce.product.dto.CategoryRequest;
import com.ecommerce.product.dto.CategoryResponse;
import com.ecommerce.product.entity.Category;
import com.ecommerce.product.mapper.CategoryMapper;
import com.ecommerce.product.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;

    @Cacheable(value = "categories", key = "'all'")
    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAllByIsDeletedFalse().stream()
                .map(categoryMapper::toResponse)
                .collect(Collectors.toList());
    }

    @CacheEvict(value = "categories", allEntries = true)
    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        if (categoryRepository.existsByNameAndIsDeletedFalse(request.getName())) {
            throw new ConflictException("Category with name " + request.getName() + " already exists.");
        }

        Category category = categoryMapper.toEntity(request);
        
        if (request.getParentCategoryId() != null) {
            Category parent = categoryRepository.findByIdAndIsDeletedFalse(request.getParentCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parent Category not found"));
            category.setParentCategory(parent);
        }

        Category savedCategory = categoryRepository.save(category);
        return categoryMapper.toResponse(savedCategory);
    }

    @CacheEvict(value = "categories", allEntries = true)
    @Transactional
    public CategoryResponse updateCategory(UUID id, CategoryRequest request) {
        Category category = categoryRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        if (!category.getName().equals(request.getName()) && categoryRepository.existsByNameAndIsDeletedFalse(request.getName())) {
            throw new ConflictException("Category with name " + request.getName() + " already exists.");
        }

        categoryMapper.updateEntityFromRequest(request, category);

        if (request.getParentCategoryId() != null) {
            Category parent = categoryRepository.findByIdAndIsDeletedFalse(request.getParentCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parent Category not found"));
            category.setParentCategory(parent);
        } else {
            category.setParentCategory(null);
        }

        return categoryMapper.toResponse(categoryRepository.save(category));
    }

    @CacheEvict(value = "categories", allEntries = true)
    @Transactional
    public void deleteCategory(UUID id) {
        Category category = categoryRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        
        category.setDeleted(true);
        categoryRepository.save(category);
    }
}
