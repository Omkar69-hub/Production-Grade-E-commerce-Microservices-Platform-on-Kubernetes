package com.ecommerce.product.controller;

import com.ecommerce.common.security.CustomAuthenticationEntryPoint;
import com.ecommerce.common.security.JwtUtil;
import com.ecommerce.product.dto.CategoryResponse;
import com.ecommerce.product.security.JwtFilter;
import com.ecommerce.product.security.SecurityConfig;
import com.ecommerce.product.service.CategoryService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(CategoryController.class)
@ContextConfiguration(classes = {
    CategoryController.class,
    SecurityConfig.class,
    JwtFilter.class,
    CustomAuthenticationEntryPoint.class,
    JwtUtil.class
})
class CategoryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CategoryService categoryService;

    @Test
    void givenPublicAccess_whenGetAllCategories_thenReturnsStorefrontCategories() throws Exception {
        CategoryResponse clothing = CategoryResponse.builder()
                .name("Clothing")
                .description("Haute Couture Apparel")
                .build();

        when(categoryService.getStorefrontCategories()).thenReturn(List.of(clothing));

        mockMvc.perform(get("/api/v1/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].name").value("Clothing"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void givenAdminRole_whenGetAllCategoriesWithIncludeAll_thenReturnsAllCategories() throws Exception {
        CategoryResponse electronics = CategoryResponse.builder()
                .name("Electronics")
                .description("Legacy Electronics")
                .build();

        when(categoryService.getAllCategories()).thenReturn(List.of(electronics));

        mockMvc.perform(get("/api/v1/categories?includeAll=true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].name").value("Electronics"));
    }

    @Test
    void givenPublicAccess_whenIncludeAllTrue_thenStillCallsStorefrontCategories() throws Exception {
        CategoryResponse clothing = CategoryResponse.builder()
                .name("Clothing")
                .build();

        when(categoryService.getStorefrontCategories()).thenReturn(List.of(clothing));

        mockMvc.perform(get("/api/v1/categories?includeAll=true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].name").value("Clothing"));
    }
}
