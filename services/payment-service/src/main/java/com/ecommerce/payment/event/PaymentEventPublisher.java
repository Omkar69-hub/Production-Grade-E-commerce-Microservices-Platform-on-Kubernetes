package com.ecommerce.payment.event;

import com.ecommerce.payment.config.RabbitMQConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

@Slf4j
@Component
@RequiredArgsConstructor
public class PaymentEventPublisher {

    private final RabbitTemplate rabbitTemplate;

    public void publishPaymentCompleted(PaymentEvent event) {
        publishAfterCommit(() -> {
            log.info("Publishing PaymentCompletedEvent for Order ID: {}", event.getOrderId());
            rabbitTemplate.convertAndSend(RabbitMQConfig.PAYMENT_EXCHANGE, "payment.completed", event);
        });
    }

    public void publishPaymentFailed(PaymentEvent event) {
        publishAfterCommit(() -> {
            log.info("Publishing PaymentFailedEvent for Order ID: {}", event.getOrderId());
            rabbitTemplate.convertAndSend(RabbitMQConfig.PAYMENT_EXCHANGE, "payment.failed", event);
        });
    }

    public void publishRefundCompleted(PaymentEvent event) {
        publishAfterCommit(() -> {
            log.info("Publishing RefundCompletedEvent for Order ID: {}", event.getOrderId());
            rabbitTemplate.convertAndSend(RabbitMQConfig.PAYMENT_EXCHANGE, "payment.refunded", event);
        });
    }

    private void publishAfterCommit(Runnable publishAction) {
        if (TransactionSynchronizationManager.isActualTransactionActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    publishAction.run();
                }
            });
        } else {
            publishAction.run();
        }
    }
}
