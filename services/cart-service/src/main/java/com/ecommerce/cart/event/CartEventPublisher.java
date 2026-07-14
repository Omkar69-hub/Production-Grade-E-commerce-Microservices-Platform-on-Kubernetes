package com.ecommerce.cart.event;

import com.ecommerce.cart.config.RabbitMQConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class CartEventPublisher {

    private final RabbitTemplate rabbitTemplate;

    public void publishCartCreated(UUID userId) {
        publishEvent(userId, "CREATED", 1);
    }

    public void publishCartUpdated(UUID userId, int totalItems) {
        publishEvent(userId, "UPDATED", totalItems);
    }

    public void publishCartCleared(UUID userId) {
        publishEvent(userId, "CLEARED", 0);
    }

    private void publishEvent(UUID userId, String action, int totalItems) {
        CartEvent event = CartEvent.builder()
                .userId(userId)
                .action(action)
                .totalItems(totalItems)
                .build();
        log.info("Publishing Cart{}Event for User ID: {}", action, userId);
        rabbitTemplate.convertAndSend(RabbitMQConfig.CART_EXCHANGE, "cart." + action.toLowerCase(), event);
    }
}
