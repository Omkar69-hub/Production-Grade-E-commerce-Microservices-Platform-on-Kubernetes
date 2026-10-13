package com.ecommerce.order.controller;

import com.ecommerce.order.dto.OrderRequest;
import com.ecommerce.order.dto.OrderResponse;
import com.ecommerce.order.dto.ShippingAddressDto;
import com.ecommerce.order.entity.OrderStatus;
import com.ecommerce.order.service.OrderService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ContextConfiguration;
import com.ecommerce.order.security.SecurityConfig;
import com.ecommerce.order.security.JwtFilter;
import com.ecommerce.common.security.CustomAuthenticationEntryPoint;
import com.ecommerce.common.security.JwtUtil;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(OrderController.class)
@ContextConfiguration(classes = {
    OrderController.class,
    SecurityConfig.class,
    JwtFilter.class,
    CustomAuthenticationEntryPoint.class,
    JwtUtil.class
})
class OrderControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private OrderService orderService;

    @Test
    @WithMockUser(username = "123e4567-e89b-12d3-a456-426614174000")
    void givenAuthenticatedUser_whenGetOrder_thenReturns200() throws Exception {
        UUID userId = UUID.fromString("123e4567-e89b-12d3-a456-426614174000");
        UUID orderId = UUID.randomUUID();
        
        OrderResponse response = OrderResponse.builder()
                .userId(userId)
                .orderNumber("ORD-12345678")
                .status(OrderStatus.PENDING)
                .totalAmount(BigDecimal.valueOf(100.0))
                .build();

        when(orderService.getOrder(userId, orderId)).thenReturn(response);

        mockMvc.perform(get("/api/v1/orders/" + orderId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.orderNumber").value("ORD-12345678"));
    }

    @Test
    @WithMockUser(username = "123e4567-e89b-12d3-a456-426614174000")
    void givenAuthenticatedUser_whenCreateOrder_thenReturns201() throws Exception {
        UUID userId = UUID.fromString("123e4567-e89b-12d3-a456-426614174000");
        
        ShippingAddressDto address = ShippingAddressDto.builder()
                .fullName("John Doe")
                .street("123 Main St")
                .city("Anytown")
                .state("NY")
                .zipCode("12345")
                .country("USA")
                .phoneNumber("+1234567890")
                .build();
                
        OrderRequest request = OrderRequest.builder()
                .shippingAddress(address)
                .paymentMethod("CREDIT_CARD")
                .build();

        OrderResponse response = OrderResponse.builder()
                .userId(userId)
                .orderNumber("ORD-87654321")
                .status(OrderStatus.PENDING)
                .totalAmount(BigDecimal.valueOf(250.0))
                .build();

        // Note: Mocking token extraction logic is simpler when we match any string for token
        when(orderService.createOrder(eq(userId), any(String.class), any(OrderRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/orders")
                .header("Authorization", "Bearer mock-jwt-token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.orderNumber").value("ORD-87654321"));
    }
}
