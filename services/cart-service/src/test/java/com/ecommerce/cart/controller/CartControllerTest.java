package com.ecommerce.cart.controller;

import com.ecommerce.cart.dto.CartItemRequest;
import com.ecommerce.cart.dto.CartResponse;
import com.ecommerce.cart.service.CartService;
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
class CartControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private CartService cartService;

    @Test
    @WithMockUser(username = "123e4567-e89b-12d3-a456-426614174000")
    void givenAuthenticatedUser_whenGetCart_thenReturns200() throws Exception {
        UUID userId = UUID.fromString("123e4567-e89b-12d3-a456-426614174000");
        CartResponse response = CartResponse.builder()
                .userId(userId)
                .subtotal(BigDecimal.ZERO)
                .items(List.of())
                .build();

        when(cartService.getCart(userId)).thenReturn(response);

        mockMvc.perform(get("/api/v1/cart"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.userId").value(userId.toString()))
                .andExpect(jsonPath("$.message").value("Cart retrieved successfully"));
    }

    @Test
    @WithMockUser(username = "123e4567-e89b-12d3-a456-426614174000")
    void givenAuthenticatedUser_whenAddItem_thenReturns200() throws Exception {
        UUID userId = UUID.fromString("123e4567-e89b-12d3-a456-426614174000");
        CartItemRequest request = CartItemRequest.builder()
                .productId(UUID.randomUUID())
                .quantity(2)
                .build();

        CartResponse response = CartResponse.builder()
                .userId(userId)
                .subtotal(BigDecimal.valueOf(200.0))
                .build();

        when(cartService.addItemToCart(any(), any(CartItemRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/cart/items")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.subtotal").value(200.0));
    }

    @Test
    void givenUnauthenticatedUser_whenGetCart_thenReturns401() throws Exception {
        mockMvc.perform(get("/api/v1/cart"))
                .andExpect(status().isUnauthorized()); // Intercepted by Security config or our filter handling
    }
}
