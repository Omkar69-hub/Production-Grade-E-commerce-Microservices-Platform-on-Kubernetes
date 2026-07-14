package com.ecommerce.payment.service;

import com.ecommerce.common.exception.BusinessException;
import com.ecommerce.common.exception.ResourceNotFoundException;
import com.ecommerce.payment.dto.PaymentRequest;
import com.ecommerce.payment.dto.PaymentResponse;
import com.ecommerce.payment.entity.Payment;
import com.ecommerce.payment.entity.PaymentStatus;
import com.ecommerce.payment.event.PaymentEvent;
import com.ecommerce.payment.event.PaymentEventPublisher;
import com.ecommerce.payment.mapper.PaymentMapper;
import com.ecommerce.payment.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final PaymentMapper paymentMapper;
    private final PaymentEventPublisher eventPublisher;

    @Transactional
    public void initializePayment(UUID orderId, UUID userId, BigDecimal amount) {
        if (paymentRepository.findByOrderId(orderId).isPresent()) {
            log.warn("Payment record already exists for Order ID: {}", orderId);
            return;
        }

        Payment payment = Payment.builder()
                .orderId(orderId)
                .userId(userId)
                .amount(amount)
                .status(PaymentStatus.PENDING)
                .paymentMethod("UNSPECIFIED") // Will be updated during processPayment
                .build();

        paymentRepository.save(payment);
        log.info("Initialized Pending Payment for Order ID: {}", orderId);
    }

    @Transactional(readOnly = true)
    public PaymentResponse getPaymentByOrderId(UUID orderId, UUID userId) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found for order"));
                
        if (!payment.getUserId().equals(userId)) {
            throw new ResourceNotFoundException("Payment not found for user");
        }
        
        return paymentMapper.toResponse(payment);
    }

    @Transactional
    public PaymentResponse processPayment(PaymentRequest request, UUID userId) {
        Payment payment = paymentRepository.findByOrderId(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found for order"));

        if (!payment.getUserId().equals(userId)) {
            throw new ResourceNotFoundException("Payment not found for user");
        }

        if (payment.getStatus() == PaymentStatus.COMPLETED) {
            throw new BusinessException("Payment is already completed");
        }

        payment.setPaymentMethod(request.getPaymentMethod());

        // MOCK PAYMENT GATEWAY INTEGRATION
        // In a real application, we would call Stripe, PayPal, etc. here.
        boolean paymentSuccess = mockPaymentGatewayCall(request.getToken(), payment.getAmount());

        if (paymentSuccess) {
            payment.setStatus(PaymentStatus.COMPLETED);
            payment.setTransactionId("TXN-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase());
            
            Payment savedPayment = paymentRepository.save(payment);
            
            eventPublisher.publishPaymentCompleted(PaymentEvent.builder()
                    .paymentId(savedPayment.getId())
                    .orderId(savedPayment.getOrderId())
                    .status("COMPLETED")
                    .transactionId(savedPayment.getTransactionId())
                    .build());
                    
            return paymentMapper.toResponse(savedPayment);
        } else {
            payment.setStatus(PaymentStatus.FAILED);
            payment.setTransactionId("FAILED-" + UUID.randomUUID().toString().substring(0, 8));
            
            Payment savedPayment = paymentRepository.save(payment);
            
            eventPublisher.publishPaymentFailed(PaymentEvent.builder()
                    .paymentId(savedPayment.getId())
                    .orderId(savedPayment.getOrderId())
                    .status("FAILED")
                    .transactionId(savedPayment.getTransactionId())
                    .build());
                    
            throw new BusinessException("Payment processing failed");
        }
    }

    @Transactional
    public PaymentResponse processRefund(UUID orderId) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found for order"));

        if (payment.getStatus() != PaymentStatus.COMPLETED) {
            throw new BusinessException("Cannot refund a payment that is not completed");
        }

        // MOCK REFUND CALL
        payment.setStatus(PaymentStatus.REFUNDED);
        Payment savedPayment = paymentRepository.save(payment);

        eventPublisher.publishRefundCompleted(PaymentEvent.builder()
                .paymentId(savedPayment.getId())
                .orderId(savedPayment.getOrderId())
                .status("REFUNDED")
                .transactionId(savedPayment.getTransactionId())
                .build());

        return paymentMapper.toResponse(savedPayment);
    }

    /**
     * Simulates a payment gateway call.
     * Rejects payment if the token contains the word "fail".
     */
    private boolean mockPaymentGatewayCall(String token, BigDecimal amount) {
        log.info("Mocking payment call for amount: ${}", amount);
        return token == null || !token.toLowerCase().contains("fail");
    }
}
