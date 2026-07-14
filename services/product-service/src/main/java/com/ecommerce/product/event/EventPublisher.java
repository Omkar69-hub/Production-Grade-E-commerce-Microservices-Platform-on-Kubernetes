package com.ecommerce.product.event;

import com.ecommerce.product.config.RabbitMQConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class EventPublisher {

    private final RabbitTemplate rabbitTemplate;

    public void publishProductCreated(ProductCreatedEvent event) {
        log.info("Publishing ProductCreatedEvent for Product ID: {}", event.getProductId());
        rabbitTemplate.convertAndSend(RabbitMQConfig.PRODUCT_EXCHANGE, "product.created", event);
    }

    public void publishProductUpdated(ProductUpdatedEvent event) {
        log.info("Publishing ProductUpdatedEvent for Product ID: {}", event.getProductId());
        rabbitTemplate.convertAndSend(RabbitMQConfig.PRODUCT_EXCHANGE, "product.updated", event);
    }

    public void publishProductDeleted(ProductDeletedEvent event) {
        log.info("Publishing ProductDeletedEvent for Product ID: {}", event.getProductId());
        rabbitTemplate.convertAndSend(RabbitMQConfig.PRODUCT_EXCHANGE, "product.deleted", event);
    }

    public void publishInventoryUpdated(InventoryUpdatedEvent event) {
        log.info("Publishing InventoryUpdatedEvent for Product ID: {}", event.getProductId());
        rabbitTemplate.convertAndSend(RabbitMQConfig.PRODUCT_EXCHANGE, "inventory.updated", event);
    }
}
