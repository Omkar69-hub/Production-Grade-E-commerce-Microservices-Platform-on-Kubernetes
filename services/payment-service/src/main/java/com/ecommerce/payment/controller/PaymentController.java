package com.ecommerce.payment.controller;

import com.ecommerce.common.exception.UnauthorizedException;
import com.ecommerce.common.response.SuccessResponse;
import com.ecommerce.common.util.SecurityUtil;
import com.ecommerce.payment.dto.PaymentRequest;
import com.ecommerce.payment.dto.PaymentResponse;
import com.ecommerce.payment.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @GetMapping("/orders/{orderId}")
    public ResponseEntity<SuccessResponse<PaymentResponse>> getPaymentByOrderId(@PathVariable UUID orderId) {
        UUID userId = getCurrentUserId();
        PaymentResponse response = paymentService.getPaymentByOrderId(orderId, userId);
        
        return ResponseEntity.ok(SuccessResponse.<PaymentResponse>builder()
                .data(response)
                .message("Payment retrieved successfully")
                .build());
    }

    @PostMapping
    public ResponseEntity<SuccessResponse<PaymentResponse>> processPayment(@Valid @RequestBody PaymentRequest request) {
        UUID userId = getCurrentUserId();
        PaymentResponse response = paymentService.processPayment(request, userId);
        
        return ResponseEntity.ok(SuccessResponse.<PaymentResponse>builder()
                .data(response)
                .message("Payment processed successfully")
                .build());
    }

    @PostMapping("/orders/{orderId}/refund")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SuccessResponse<PaymentResponse>> refundPayment(@PathVariable UUID orderId) {
        PaymentResponse response = paymentService.processRefund(orderId);
        
        return ResponseEntity.ok(SuccessResponse.<PaymentResponse>builder()
                .data(response)
                .message("Refund processed successfully")
                .build());
    }

    private UUID getCurrentUserId() {
        return UUID.fromString(SecurityUtil.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("User must be authenticated to access payments")));
    }
}
