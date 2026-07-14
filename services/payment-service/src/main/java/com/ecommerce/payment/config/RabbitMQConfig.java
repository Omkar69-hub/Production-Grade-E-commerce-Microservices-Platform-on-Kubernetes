package com.ecommerce.payment.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String PAYMENT_EXCHANGE = "payment.exchange";
    public static final String ORDER_EXCHANGE = "order.exchange";
    public static final String PAYMENT_ORDER_QUEUE = "payment.order.queue";

    @Bean
    public TopicExchange paymentExchange() {
        return new TopicExchange(PAYMENT_EXCHANGE);
    }

    @Bean
    public TopicExchange orderExchange() {
        return new TopicExchange(ORDER_EXCHANGE);
    }

    @Bean
    public Queue paymentOrderQueue() {
        return new Queue(PAYMENT_ORDER_QUEUE, true);
    }

    @Bean
    public Binding paymentOrderBinding(Queue paymentOrderQueue, TopicExchange orderExchange) {
        return BindingBuilder.bind(paymentOrderQueue).to(orderExchange).with("order.created");
    }

    @Bean
    public MessageConverter messageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
