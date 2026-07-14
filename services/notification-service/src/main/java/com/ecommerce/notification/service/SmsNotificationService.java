package com.ecommerce.notification.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class SmsNotificationService {

    public void sendSms(String phoneNumber, String message) {
        // This is an abstraction for SMS delivery. 
        // In a real application, this would integrate with Twilio, AWS SNS, etc.
        log.info("Mock SMS sent to {}: {}", phoneNumber, message);
    }
}
