package com.ecommerce.payment.event;

import com.ecommerce.payment.config.RabbitMQConfig;
import com.ecommerce.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class OrderEventConsumer {

    private final PaymentService paymentService;

    @RabbitListener(queues = RabbitMQConfig.PAYMENT_ORDER_QUEUE)
    public void handleOrderCreatedEvent(OrderEvent event) {
        log.info("Received OrderCreatedEvent for Order ID: {}", event.getOrderId());
        try {
            // Note: In this scenario, we create a pending payment record that 
            // the user will need to fulfill, or we automatically attempt to charge a stored card.
            // For this design, we will just prepare the Payment record.
            paymentService.initializePayment(event.getOrderId(), event.getUserId(), event.getTotalAmount());
        } catch (Exception e) {
            log.error("Error processing OrderCreatedEvent for Order ID: {}", event.getOrderId(), e);
        }
    }
}
