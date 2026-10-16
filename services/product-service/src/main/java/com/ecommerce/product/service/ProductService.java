package com.ecommerce.product.service;

import com.ecommerce.common.dto.PageResponse;
import com.ecommerce.common.dto.PaginationDto;
import com.ecommerce.common.exception.ConflictException;
import com.ecommerce.common.exception.ResourceNotFoundException;
import com.ecommerce.common.exception.ValidationException;
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
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.net.URI;
import java.net.URISyntaxException;
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
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> searchProducts(UUID categoryId, String name, String brand, PaginationDto pagination) {
        return searchProducts(categoryId, name, brand, null, null, pagination);
    }

    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> searchProducts(UUID categoryId, String name, String brand, BigDecimal minPrice, BigDecimal maxPrice, PaginationDto pagination) {
        Sort sort = parseSort(pagination.getSort());
        Pageable pageable = PageRequest.of(pagination.getPage(), pagination.getSize(), sort);

        Page<Product> productPage = productRepository.searchProducts(categoryId, name, brand, minPrice, maxPrice, pageable);

        return PageResponse.<ProductResponse>builder()
                .content(productPage.getContent().stream().map(productMapper::toResponse).collect(Collectors.toList()))
                .pageNumber(productPage.getNumber())
                .pageSize(productPage.getSize())
                .totalElements(productPage.getTotalElements())
                .totalPages(productPage.getTotalPages())
                .last(productPage.isLast())
                .build();
    }

    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> searchAllProducts(UUID categoryId, String name, String brand, PaginationDto pagination) {
        return searchAllProducts(categoryId, name, brand, null, null, pagination);
    }

    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> searchAllProducts(UUID categoryId, String name, String brand, BigDecimal minPrice, BigDecimal maxPrice, PaginationDto pagination) {
        Sort sort = parseSort(pagination.getSort());
        Pageable pageable = PageRequest.of(pagination.getPage(), pagination.getSize(), sort);

        Page<Product> productPage = productRepository.searchAllProducts(categoryId, name, brand, minPrice, maxPrice, pageable);

        return PageResponse.<ProductResponse>builder()
                .content(productPage.getContent().stream().map(productMapper::toResponse).collect(Collectors.toList()))
                .pageNumber(productPage.getNumber())
                .pageSize(productPage.getSize())
                .totalElements(productPage.getTotalElements())
                .totalPages(productPage.getTotalPages())
                .last(productPage.isLast())
                .build();
    }

    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> searchProducts(UUID categoryId, String name, String brand, boolean includeAll, PaginationDto pagination) {
        return includeAll 
                ? searchAllProducts(categoryId, name, brand, pagination) 
                : searchProducts(categoryId, name, brand, pagination);
    }

    private Sort parseSort(String sortParam) {
        if (sortParam == null || sortParam.isBlank()) {
            return Sort.by(Sort.Direction.DESC, "createdAt");
        }
        String s = sortParam.trim().toLowerCase();
        if ("price-asc".equals(s) || "price,asc".equals(s)) {
            return Sort.by(Sort.Direction.ASC, "price");
        }
        if ("price-desc".equals(s) || "price,desc".equals(s)) {
            return Sort.by(Sort.Direction.DESC, "price");
        }
        if ("name-asc".equals(s) || "name,asc".equals(s)) {
            return Sort.by(Sort.Direction.ASC, "name");
        }
        if ("name-desc".equals(s) || "name,desc".equals(s)) {
            return Sort.by(Sort.Direction.DESC, "name");
        }
        if ("asc".equals(s)) {
            return Sort.by(Sort.Direction.ASC, "createdAt");
        }
        return Sort.by(Sort.Direction.DESC, "createdAt");
    }

    public void validateAttributes(String attributes) {
        if (attributes == null || attributes.isBlank()) {
            return;
        }
        try {
            JsonNode root = objectMapper.readTree(attributes);
            if (!root.isObject()) {
                throw new ValidationException("Attributes must be a valid JSON object");
            }
            if (root.has("destinationUrl")) {
                JsonNode urlNode = root.get("destinationUrl");
                if (!urlNode.isTextual() || urlNode.asText().isBlank()) {
                    throw new ValidationException("Destination URL must be a non-empty string");
                }
                String destUrl = urlNode.asText().trim();
                String lowerUrl = destUrl.toLowerCase();

                // Reject dangerous execution-capable schemes
                if (lowerUrl.startsWith("javascript:") || lowerUrl.startsWith("data:") || 
                    lowerUrl.startsWith("file:") || lowerUrl.startsWith("vbscript:")) {
                    throw new ValidationException("Dangerous protocol disallowed: execution-capable schemes are prohibited");
                }

                URI uri;
                try {
                    uri = new URI(destUrl);
                } catch (URISyntaxException e) {
                    throw new ValidationException("Invalid destination URL syntax: " + e.getMessage());
                }

                // 1. Require secure HTTPS scheme
                String scheme = uri.getScheme();
                if (scheme == null || !scheme.equalsIgnoreCase("https")) {
                    throw new ValidationException("Destination URL must use secure HTTPS protocol (found: " + (scheme != null ? scheme : "none") + ")");
                }

                // 2. Reject embedded user credentials (user:pass@host)
                if (uri.getUserInfo() != null || uri.getRawUserInfo() != null) {
                    throw new ValidationException("Embedded credentials in destination URL are disallowed");
                }

                // 3. Validate Hostname
                String host = uri.getHost();
                if (host == null || host.isBlank()) {
                    throw new ValidationException("Destination URL must contain a valid, non-empty hostname");
                }

                String lowerHost = host.toLowerCase();
                if (!lowerHost.contains(".") || lowerHost.startsWith(".") || lowerHost.endsWith(".")) {
                    throw new ValidationException("Destination hostname must contain a valid domain boundary");
                }

                if (lowerHost.contains("..") || lowerHost.contains(" ") || lowerHost.contains("@") || lowerHost.contains(":")) {
                    throw new ValidationException("Destination hostname contains illegal characters");
                }

                // 4. Reject deceptive hostname patterns / suspicious suffixes
                String[] deceptiveTlds = {".com.", ".in.", ".org.", ".net.", ".co.in.", ".fr.", ".it.", ".eu.", ".co.uk."};
                for (String tld : deceptiveTlds) {
                    if (lowerHost.contains(tld)) {
                        throw new ValidationException("Deceptive hostname structure: TLD segment appears before terminal domain boundary in " + host);
                    }
                }

                if (lowerHost.endsWith(".test") || lowerHost.endsWith(".example") || lowerHost.endsWith(".invalid") || 
                    lowerHost.endsWith(".localhost") || lowerHost.endsWith(".local")) {
                    throw new ValidationException("Destination URL cannot point to test or reserved domain: " + host);
                }

                // 5. Reject unverified open-redirect query parameters
                String query = uri.getQuery();
                if (query != null && !query.isBlank()) {
                    String lowerQuery = query.toLowerCase();
                    if (lowerQuery.contains("redirect=") || lowerQuery.contains("dest=") || 
                        lowerQuery.contains("destination=") || lowerQuery.contains("url=http")) {
                        throw new ValidationException("Destination URL contains unverified open-redirect query parameters");
                    }
                }
            }

            if (root.has("destinationType")) {
                JsonNode typeNode = root.get("destinationType");
                if (!typeNode.isTextual() || typeNode.asText().isBlank()) {
                    throw new ValidationException("destinationType must be a non-empty string");
                }
                String destType = typeNode.asText().trim();
                if (!"EXACT_PRODUCT_PAGE".equals(destType) && !"OFFICIAL_CATEGORY_DESTINATION".equals(destType)) {
                    throw new ValidationException("Invalid destinationType. Must be EXACT_PRODUCT_PAGE or OFFICIAL_CATEGORY_DESTINATION");
                }
            }

            if (root.has("priceVerificationStatus")) {
                JsonNode statusNode = root.get("priceVerificationStatus");
                if (!statusNode.isTextual() || statusNode.asText().isBlank()) {
                    throw new ValidationException("priceVerificationStatus must be a non-empty string");
                }
                String status = statusNode.asText().trim();
                if (!"VERIFIED_ATELIER_PRICE".equals(status) && !"PRICE_UPON_INQUIRY".equals(status) && !"ILLUSTRATIVE_ESTIMATE".equals(status)) {
                    throw new ValidationException("Invalid priceVerificationStatus. Must be VERIFIED_ATELIER_PRICE, PRICE_UPON_INQUIRY, or ILLUSTRATIVE_ESTIMATE");
                }
            }

            if (root.has("fulfillmentType")) {
                JsonNode ftNode = root.get("fulfillmentType");
                if (!ftNode.isTextual() || ftNode.asText().isBlank()) {
                    throw new ValidationException("fulfillmentType must be a non-empty string");
                }
                String ft = ftNode.asText().trim();
                if (!"REFERRAL_LINK".equals(ft) && !"INTERNAL".equals(ft)) {
                    throw new ValidationException("Unknown or unsupported fulfillmentType: " + ft);
                }
            }

            if (root.has("isReferral")) {
                JsonNode refNode = root.get("isReferral");
                if (!refNode.isBoolean()) {
                    throw new ValidationException("isReferral must be a boolean");
                }
            }

            if (root.has("isEditorialConcept")) {
                JsonNode edNode = root.get("isEditorialConcept");
                if (!edNode.isBoolean()) {
                    throw new ValidationException("isEditorialConcept must be a boolean");
                }
            }

            // Referral and inquiry consistency checks
            boolean hasIsReferral = root.has("isReferral");
            boolean isReferralTrue = hasIsReferral && root.get("isReferral").asBoolean();

            boolean hasDestinationUrl = root.has("destinationUrl") && !root.get("destinationUrl").asText().isBlank();
            String fulfillmentType = root.has("fulfillmentType") ? root.get("fulfillmentType").asText().trim() : null;
            boolean isReferralFulfillment = "REFERRAL_LINK".equals(fulfillmentType);

            // 1. If isReferral is explicitly true, require non-blank destinationUrl, REFERRAL_LINK fulfillmentType, and destinationType
            if (isReferralTrue) {
                if (!hasDestinationUrl) {
                    throw new ValidationException("Referral products must include a valid non-empty destinationUrl");
                }
                if (!isReferralFulfillment) {
                    throw new ValidationException("Referral products must specify fulfillmentType as REFERRAL_LINK");
                }
                if (!root.has("destinationType") || root.get("destinationType").asText().isBlank()) {
                    throw new ValidationException("Referral products must specify destinationType (EXACT_PRODUCT_PAGE or OFFICIAL_CATEGORY_DESTINATION)");
                }
            }

            // 2. Contradictory referral markers: isReferral is not explicitly true
            if (!isReferralTrue) {
                if (hasDestinationUrl) {
                    throw new ValidationException("Contradictory referral metadata: Products with a destinationUrl must explicitly declare isReferral as true");
                }
                if (isReferralFulfillment) {
                    throw new ValidationException("Contradictory referral metadata: Referral fulfillmentType requires isReferral to be explicitly true");
                }
                if (root.has("destinationType") && !root.get("destinationType").asText().isBlank()) {
                    throw new ValidationException("Contradictory referral metadata: Ordinary internal products cannot declare destinationType");
                }
            }
        } catch (com.fasterxml.jackson.core.JsonProcessingException e) {
            throw new ValidationException("Attributes must be valid JSON: " + e.getMessage());
        }
    }

    public void validateProductPricing(BigDecimal price, String attributes) {
        if (price == null) {
            throw new ValidationException("Product price cannot be null");
        }
        if (price.compareTo(BigDecimal.ZERO) < 0) {
            throw new ValidationException("Product price cannot be negative");
        }
        if (price.compareTo(BigDecimal.ZERO) == 0) {
            if (attributes == null || attributes.isBlank()) {
                throw new ValidationException("Internally purchasable products must have a strictly positive price. Non-positive pricing is only permitted for explicit inquiry-only (PRICE_UPON_INQUIRY) or verified referral concepts.");
            }
            try {
                JsonNode root = objectMapper.readTree(attributes);
                boolean isInquiry = root.has("priceVerificationStatus") && 
                        "PRICE_UPON_INQUIRY".equalsIgnoreCase(root.get("priceVerificationStatus").asText());

                boolean isExplicitReferral = root.has("isReferral") && root.get("isReferral").asBoolean() &&
                        root.has("destinationUrl") && !root.get("destinationUrl").asText().isBlank() &&
                        root.has("fulfillmentType") && "REFERRAL_LINK".equals(root.get("fulfillmentType").asText().trim()) &&
                        root.has("destinationType");

                if (!isInquiry && !isExplicitReferral) {
                    throw new ValidationException("Internally purchasable products must have a strictly positive price. Non-positive pricing is only permitted for explicit inquiry-only (PRICE_UPON_INQUIRY) or verified referral concepts.");
                }
            } catch (com.fasterxml.jackson.core.JsonProcessingException e) {
                throw new ValidationException("Attributes must be valid JSON: " + e.getMessage());
            }
        } else {
            // Positive price: Ordinary internal products require a positive price and cannot carry referral-only metadata
            if (attributes != null && !attributes.isBlank()) {
                try {
                    JsonNode root = objectMapper.readTree(attributes);
                    if (root.has("isReferral") && root.get("isReferral").asBoolean()) {
                        throw new ValidationException("Internally purchasable products with positive prices cannot declare isReferral as true");
                    }
                    if (root.has("destinationUrl") && !root.get("destinationUrl").asText().isBlank()) {
                        throw new ValidationException("Internally purchasable products with positive prices cannot carry destinationUrl");
                    }
                    if (root.has("destinationType") && !root.get("destinationType").asText().isBlank()) {
                        throw new ValidationException("Internally purchasable products with positive prices cannot carry destinationType");
                    }
                    if (root.has("fulfillmentType") && "REFERRAL_LINK".equalsIgnoreCase(root.get("fulfillmentType").asText().trim())) {
                        throw new ValidationException("Internally purchasable products with positive prices cannot specify REFERRAL_LINK fulfillment");
                    }
                    if (root.has("priceVerificationStatus") && "PRICE_UPON_INQUIRY".equalsIgnoreCase(root.get("priceVerificationStatus").asText().trim())) {
                        throw new ValidationException("Internally purchasable products with positive prices cannot specify PRICE_UPON_INQUIRY");
                    }
                } catch (com.fasterxml.jackson.core.JsonProcessingException e) {
                    throw new ValidationException("Attributes must be valid JSON: " + e.getMessage());
                }
            }
        }
    }

    @Cacheable(value = "products", key = "#id")
    @Transactional(readOnly = true)
    public ProductResponse getProduct(UUID id) {
        Product product = productRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        return productMapper.toResponse(product);
    }

    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        validateAttributes(request.getAttributes());
        validateProductPricing(request.getPrice(), request.getAttributes());

        if (productRepository.existsBySkuAndDeletedFalse(request.getSku())) {
            throw new ConflictException("Product with SKU " + request.getSku() + " already exists.");
        }

        Category category = categoryRepository.findByIdAndDeletedFalse(request.getCategoryId())
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
        validateAttributes(request.getAttributes());
        validateProductPricing(request.getPrice(), request.getAttributes());

        Product product = productRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        if (!product.getSku().equals(request.getSku()) && productRepository.existsBySkuAndDeletedFalse(request.getSku())) {
            throw new ConflictException("Product with SKU " + request.getSku() + " already exists.");
        }

        Category category = categoryRepository.findByIdAndDeletedFalse(request.getCategoryId())
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
        Product product = productRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        
        product.setDeleted(true);
        productRepository.save(product);

        eventPublisher.publishProductDeleted(ProductDeletedEvent.builder()
                .productId(product.getId())
                .sku(product.getSku())
                .build());
    }
}
