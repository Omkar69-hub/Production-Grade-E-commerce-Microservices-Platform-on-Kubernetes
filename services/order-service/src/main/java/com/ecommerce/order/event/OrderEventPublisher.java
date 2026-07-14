package com.ecommerce.order.event;

import com.ecommerce.order.config.RabbitMQConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class OrderEventPublisher {

    private final RabbitTemplate rabbitTemplate;

    public void publishOrderCreated(OrderCreatedEvent event) {
        log.info("Publishing OrderCreatedEvent for Order ID: {}", event.getOrderId());
        rabbitTemplate.convertAndSend(RabbitMQConfig.ORDER_EXCHANGE, "order.created", event);
    }

    public void publishOrderConfirmed(OrderStatusEvent event) {
        log.info("Publishing OrderConfirmedEvent for Order ID: {}", event.getOrderId());
        rabbitTemplate.convertAndSend(RabbitMQConfig.ORDER_EXCHANGE, "order.confirmed", event);
    }

    public void publishOrderCancelled(OrderStatusEvent event) {
        log.info("Publishing OrderCancelledEvent for Order ID: {}", event.getOrderId());
        rabbitTemplate.convertAndSend(RabbitMQConfig.ORDER_EXCHANGE, "order.cancelled", event);
    }

    public void publishOrderCompleted(OrderStatusEvent event) {
        log.info("Publishing OrderCompletedEvent for Order ID: {}", event.getOrderId());
        rabbitTemplate.convertAndSend(RabbitMQConfig.ORDER_EXCHANGE, "order.completed", event);
    }
}
