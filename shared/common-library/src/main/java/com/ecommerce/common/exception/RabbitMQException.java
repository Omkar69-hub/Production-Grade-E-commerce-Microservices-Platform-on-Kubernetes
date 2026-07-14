package com.ecommerce.common.exception;

public class RabbitMQException extends RuntimeException {
    public RabbitMQException(String message, Throwable cause) {
        super(message, cause);
    }
}
