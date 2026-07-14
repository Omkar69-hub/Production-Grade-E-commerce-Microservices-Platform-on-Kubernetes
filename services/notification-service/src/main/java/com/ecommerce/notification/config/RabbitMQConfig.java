package com.ecommerce.notification.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    // Exchanges
    public static final String AUTH_EXCHANGE = "auth.exchange";
    public static final String ORDER_EXCHANGE = "order.exchange";
    public static final String PAYMENT_EXCHANGE = "payment.exchange";
    public static final String DLX_EXCHANGE = "notification.dlx";

    // Queues
    public static final String NOTIFICATION_AUTH_QUEUE = "notification.auth.queue";
    public static final String NOTIFICATION_ORDER_QUEUE = "notification.order.queue";
    public static final String NOTIFICATION_PAYMENT_QUEUE = "notification.payment.queue";
    public static final String NOTIFICATION_DLQ = "notification.dlq";

    @Bean
    public TopicExchange authExchange() { return new TopicExchange(AUTH_EXCHANGE); }

    @Bean
    public TopicExchange orderExchange() { return new TopicExchange(ORDER_EXCHANGE); }

    @Bean
    public TopicExchange paymentExchange() { return new TopicExchange(PAYMENT_EXCHANGE); }

    @Bean
    public DirectExchange deadLetterExchange() { return new DirectExchange(DLX_EXCHANGE); }

    @Bean
    public Queue notificationDlq() { return new Queue(NOTIFICATION_DLQ, true); }

    @Bean
    public Binding dlqBinding() {
        return BindingBuilder.bind(notificationDlq()).to(deadLetterExchange()).with("notification.dead");
    }

    private Queue createQueueWithDLQ(String queueName) {
        return QueueBuilder.durable(queueName)
                .withArgument("x-dead-letter-exchange", DLX_EXCHANGE)
                .withArgument("x-dead-letter-routing-key", "notification.dead")
                .build();
    }

    @Bean
    public Queue notificationAuthQueue() { return createQueueWithDLQ(NOTIFICATION_AUTH_QUEUE); }

    @Bean
    public Queue notificationOrderQueue() { return createQueueWithDLQ(NOTIFICATION_ORDER_QUEUE); }

    @Bean
    public Queue notificationPaymentQueue() { return createQueueWithDLQ(NOTIFICATION_PAYMENT_QUEUE); }

    @Bean
    public Binding authBinding(Queue notificationAuthQueue, TopicExchange authExchange) {
        return BindingBuilder.bind(notificationAuthQueue).to(authExchange).with("auth.registered");
    }

    @Bean
    public Binding orderBinding(Queue notificationOrderQueue, TopicExchange orderExchange) {
        // Listen to both confirmed and cancelled
        return BindingBuilder.bind(notificationOrderQueue).to(orderExchange).with("order.#");
    }

    @Bean
    public Binding paymentBinding(Queue notificationPaymentQueue, TopicExchange paymentExchange) {
        return BindingBuilder.bind(notificationPaymentQueue).to(paymentExchange).with("payment.#");
    }

    @Bean
    public MessageConverter messageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
