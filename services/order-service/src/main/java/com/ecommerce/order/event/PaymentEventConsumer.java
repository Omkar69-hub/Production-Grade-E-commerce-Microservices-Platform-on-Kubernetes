package com.ecommerce.order.event;

import com.ecommerce.order.config.RabbitMQConfig;
import com.ecommerce.order.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class PaymentEventConsumer {

    private final OrderService orderService;

    @RabbitListener(queues = RabbitMQConfig.ORDER_PAYMENT_QUEUE)
    public void handlePaymentEvent(PaymentEvent event) {
        log.info("Received Payment Event for Order ID: {} with status: {}", event.getOrderId(), event.getStatus());
        try {
            if ("COMPLETED".equals(event.getStatus())) {
                orderService.confirmOrder(event.getOrderId());
            } else if ("FAILED".equals(event.getStatus())) {
                orderService.failOrder(event.getOrderId());
            }
        } catch (Exception e) {
            log.error("Error processing Payment Event for Order ID: {}", event.getOrderId(), e);
            // In a real production system, consider DLQ and retry mechanisms here
        }
    }
}
