package com.ecommerce.notification.listener;

import com.ecommerce.notification.config.RabbitMQConfig;
import com.ecommerce.notification.service.EmailService;
import com.ecommerce.order.event.OrderCreatedEvent;
import com.ecommerce.order.event.OrderStatusEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitHandler;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Slf4j
@Component
@RabbitListener(queues = RabbitMQConfig.NOTIFICATION_ORDER_QUEUE)
@RequiredArgsConstructor
public class OrderNotificationListener {

    private final EmailService emailService;

    @RabbitHandler
    public void onOrderCreated(OrderCreatedEvent event) {
        try {
            log.info("Received OrderCreatedEvent on {}: orderNumber={}, total={}", 
                    RabbitMQConfig.NOTIFICATION_ORDER_QUEUE, event.getOrderNumber(), event.getTotalAmount());
            String recipientEmail = "customer@ecommerce.com";
            emailService.sendOrderConfirmationEmail(recipientEmail, event.getOrderNumber(), event.getTotalAmount(), "CONFIRMED");
        } catch (Exception e) {
            log.error("Failed to handle order created notification message", e);
        }
    }

    @RabbitHandler
    public void onOrderStatus(OrderStatusEvent event) {
        try {
            log.info("Received OrderStatusEvent on {}: orderNumber={}, status={}", 
                    RabbitMQConfig.NOTIFICATION_ORDER_QUEUE, event.getOrderNumber(), event.getStatus());
            String recipientEmail = "customer@ecommerce.com";
            emailService.sendOrderConfirmationEmail(recipientEmail, event.getOrderNumber(), BigDecimal.ZERO, event.getStatus());
        } catch (Exception e) {
            log.error("Failed to handle order status notification message", e);
        }
    }
}
