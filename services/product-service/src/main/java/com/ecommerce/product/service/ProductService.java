package com.ecommerce.product.service;

import com.ecommerce.common.dto.PageResponse;
import com.ecommerce.common.dto.PaginationDto;
import com.ecommerce.common.exception.ConflictException;
import com.ecommerce.common.exception.ResourceNotFoundException;
import com.ecommerce.product.dto.ProductRequest;
import com.ecommerce.product.dto.ProductResponse;
import com.ecommerce.product.entity.Category;
import com.ecommerce.product.entity.Inventory;
import com.ecommerce.product.entity.Product;
import com.ecommerce.product.event.EventPublisher;
import com.ecommerce.product.event.ProductCreatedEvent;
import com.ecommerce.product.event.ProductDeletedEvent;
import com.ecommerce.product.event.ProductUpdatedEvent;
import com.ecommerce.product.mapper.ProductMapper;
import com.ecommerce.product.repository.CategoryRepository;
import com.ecommerce.product.repository.InventoryRepository;
import com.ecommerce.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final InventoryRepository inventoryRepository;
    private final ProductMapper productMapper;
    private final EventPublisher eventPublisher;

    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> searchProducts(UUID categoryId, String name, PaginationDto pagination) {
        Sort sort = Sort.by(Sort.Direction.fromString(pagination.getSort() == null ? "desc" : "asc"), "createdAt");
        Pageable pageable = PageRequest.of(pagination.getPage(), pagination.getSize(), sort);

        Page<Product> productPage = productRepository.searchProducts(categoryId, name, pageable);

        return PageResponse.<ProductResponse>builder()
                .content(productPage.getContent().stream().map(productMapper::toResponse).collect(Collectors.toList()))
                .pageNumber(productPage.getNumber())
                .pageSize(productPage.getSize())
                .totalElements(productPage.getTotalElements())
                .totalPages(productPage.getTotalPages())
                .last(productPage.isLast())
                .build();
    }

    @Cacheable(value = "products", key = "#id")
    @Transactional(readOnly = true)
    public ProductResponse getProduct(UUID id) {
        Product product = productRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        return productMapper.toResponse(product);
    }

    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        if (productRepository.existsBySkuAndIsDeletedFalse(request.getSku())) {
            throw new ConflictException("Product with SKU " + request.getSku() + " already exists.");
        }

        Category category = categoryRepository.findByIdAndIsDeletedFalse(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        Product product = productMapper.toEntity(request);
        product.setCategory(category);
        
        Inventory inventory = new Inventory();
        inventory.setProduct(product);
        product.setInventory(inventory);

        Product savedProduct = productRepository.save(product);

        eventPublisher.publishProductCreated(ProductCreatedEvent.builder()
                .productId(savedProduct.getId())
                .sku(savedProduct.getSku())
                .name(savedProduct.getName())
                .price(savedProduct.getPrice())
                .categoryId(category.getId())
                .build());

        return productMapper.toResponse(savedProduct);
    }

    @CacheEvict(value = "products", key = "#id")
    @Transactional
    public ProductResponse updateProduct(UUID id, ProductRequest request) {
        Product product = productRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        if (!product.getSku().equals(request.getSku()) && productRepository.existsBySkuAndIsDeletedFalse(request.getSku())) {
            throw new ConflictException("Product with SKU " + request.getSku() + " already exists.");
        }

        Category category = categoryRepository.findByIdAndIsDeletedFalse(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        productMapper.updateEntityFromRequest(request, product);
        product.setCategory(category);

        Product updatedProduct = productRepository.save(product);

        eventPublisher.publishProductUpdated(ProductUpdatedEvent.builder()
                .productId(updatedProduct.getId())
                .sku(updatedProduct.getSku())
                .name(updatedProduct.getName())
                .price(updatedProduct.getPrice())
                .build());

        return productMapper.toResponse(updatedProduct);
    }

    @CacheEvict(value = "products", key = "#id")
    @Transactional
    public void deleteProduct(UUID id) {
        Product product = productRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        
        product.setDeleted(true);
        productRepository.save(product);

        eventPublisher.publishProductDeleted(ProductDeletedEvent.builder()
                .productId(product.getId())
                .sku(product.getSku())
                .build());
    }
}
