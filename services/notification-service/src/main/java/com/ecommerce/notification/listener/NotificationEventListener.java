package com.ecommerce.notification.listener;

import com.ecommerce.common.response.SuccessResponse;
import com.ecommerce.notification.client.AuthServiceClient;
import com.ecommerce.notification.config.RabbitMQConfig;
import com.ecommerce.notification.event.OrderStatusEvent;
import com.ecommerce.notification.event.PaymentEvent;
import com.ecommerce.notification.event.UserRegisteredEvent;
import com.ecommerce.notification.service.EmailNotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationEventListener {

    private final EmailNotificationService emailNotificationService;
    private final AuthServiceClient authServiceClient;

    @RabbitListener(queues = RabbitMQConfig.NOTIFICATION_AUTH_QUEUE)
    public void handleUserRegistered(UserRegisteredEvent event) {
        log.info("Received UserRegisteredEvent for User ID: {}", event.getUserId());
        emailNotificationService.sendWelcomeEmail(event.getEmail(), event.getFirstName());
    }

    @RabbitListener(queues = RabbitMQConfig.NOTIFICATION_ORDER_QUEUE)
    public void handleOrderStatusChange(OrderStatusEvent event) {
        log.info("Received OrderStatusEvent for Order ID: {} with status: {}", event.getOrderId(), event.getStatus());
        
        try {
            // Note: Since OrderStatusEvent might not have the user's email directly, we fetch it.
            // In a production system, it's often better to enrich the event with the email at the source
            // to avoid synchronous dependencies in asynchronous flows.
            String email = getUserEmail(event.getUserId());

            if ("CONFIRMED".equalsIgnoreCase(event.getStatus())) {
                emailNotificationService.sendOrderConfirmationEmail(email, event.getOrderNumber());
            } else if ("CANCELLED".equalsIgnoreCase(event.getStatus()) || "PAYMENT_FAILED".equalsIgnoreCase(event.getStatus())) {
                emailNotificationService.sendPaymentFailedEmail(email, event.getOrderNumber());
            }
        } catch (Exception e) {
            log.error("Failed to process OrderStatusEvent", e);
            throw new RuntimeException("Failed to process notification", e); // Triggers DLQ
        }
    }

    @RabbitListener(queues = RabbitMQConfig.NOTIFICATION_PAYMENT_QUEUE)
    public void handlePaymentEvent(PaymentEvent event) {
        log.info("Received PaymentEvent for Order ID: {} with status: {}", event.getOrderId(), event.getStatus());
        // For this design, we are already notifying the user of order confirmation via OrderStatusEvent.
        // This listener is ready for specific payment-related notifications (e.g. sending a receipt).
    }

    private String getUserEmail(UUID userId) {
        try {
            SuccessResponse<AuthServiceClient.UserProfileDto> response = authServiceClient.getUserProfile(userId);
            return response.getData().getEmail();
        } catch (Exception e) {
            log.warn("Could not fetch user profile for ID: {}. Falling back to default routing.", userId);
            return "customer@example.com"; // Fallback for demonstration/resilience
        }
    }
}
