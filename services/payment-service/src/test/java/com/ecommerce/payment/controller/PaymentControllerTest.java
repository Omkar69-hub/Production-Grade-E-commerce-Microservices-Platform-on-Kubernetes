package com.ecommerce.payment.controller;

import com.ecommerce.payment.dto.PaymentRequest;
import com.ecommerce.payment.dto.PaymentResponse;
import com.ecommerce.payment.entity.PaymentStatus;
import com.ecommerce.payment.service.PaymentService;
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
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class PaymentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private PaymentService paymentService;

    @Test
    @WithMockUser(username = "123e4567-e89b-12d3-a456-426614174000")
    void givenAuthenticatedUser_whenGetPayment_thenReturns200() throws Exception {
        UUID userId = UUID.fromString("123e4567-e89b-12d3-a456-426614174000");
        UUID orderId = UUID.randomUUID();

        PaymentResponse response = PaymentResponse.builder()
                .userId(userId)
                .orderId(orderId)
                .amount(BigDecimal.valueOf(150.0))
                .status(PaymentStatus.PENDING)
                .build();

        when(paymentService.getPaymentByOrderId(orderId, userId)).thenReturn(response);

        mockMvc.perform(get("/api/v1/payments/orders/" + orderId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("PENDING"));
    }

    @Test
    @WithMockUser(username = "123e4567-e89b-12d3-a456-426614174000")
    void givenAuthenticatedUser_whenProcessPayment_thenReturns200() throws Exception {
        UUID userId = UUID.fromString("123e4567-e89b-12d3-a456-426614174000");
        UUID orderId = UUID.randomUUID();

        PaymentRequest request = PaymentRequest.builder()
                .orderId(orderId)
                .paymentMethod("CREDIT_CARD")
                .token("tok_visa")
                .build();

        PaymentResponse response = PaymentResponse.builder()
                .userId(userId)
                .orderId(orderId)
                .amount(BigDecimal.valueOf(150.0))
                .status(PaymentStatus.COMPLETED)
                .transactionId("TXN-123")
                .build();

        when(paymentService.processPayment(any(PaymentRequest.class), eq(userId))).thenReturn(response);

        mockMvc.perform(post("/api/v1/payments")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("COMPLETED"))
                .andExpect(jsonPath("$.data.transactionId").value("TXN-123"));
    }
}
