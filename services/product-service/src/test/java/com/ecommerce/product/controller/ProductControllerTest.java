package com.ecommerce.product.controller;

import com.ecommerce.common.dto.PageResponse;
import com.ecommerce.common.dto.PaginationDto;
import com.ecommerce.product.dto.ProductRequest;
import com.ecommerce.product.dto.ProductResponse;
import com.ecommerce.product.entity.ProductStatus;
import com.ecommerce.product.service.ProductService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ProductControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ProductService productService;

    @Test
    void givenPublicAccess_whenSearchProducts_thenReturns200() throws Exception {
        ProductResponse response = ProductResponse.builder()
                .name("Laptop")
                .sku("LAP-001")
                .price(BigDecimal.valueOf(1000.0))
                .status(ProductStatus.ACTIVE)
                .build();

        PageResponse<ProductResponse> page = PageResponse.<ProductResponse>builder()
                .content(List.of(response))
                .totalElements(1)
                .build();

        when(productService.searchProducts(any(), any(), any(PaginationDto.class))).thenReturn(page);

        mockMvc.perform(get("/api/v1/products"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content[0].name").value("Laptop"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void givenAdminRole_whenCreateProduct_thenReturns201() throws Exception {
        ProductRequest request = ProductRequest.builder()
                .categoryId(UUID.randomUUID())
                .name("Laptop")
                .sku("LAP-001")
                .price(BigDecimal.valueOf(1000.0))
                .status(ProductStatus.ACTIVE)
                .build();

        ProductResponse response = ProductResponse.builder()
                .name("Laptop")
                .sku("LAP-001")
                .build();

        when(productService.createProduct(any(ProductRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/products")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.message").value("Product created successfully"));
    }
}
