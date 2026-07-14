package com.ecommerce.notification.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailNotificationService {

    private final JavaMailSender mailSender;

    @Value("${app.notification.from-email:noreply@ecommerce.com}")
    private String fromEmail;

    public void sendWelcomeEmail(String to, String firstName) {
        String subject = "Welcome to our E-Commerce Platform!";
        String body = String.format("Hello %s,\n\nWelcome to our platform. We are excited to have you on board!\n\nBest regards,\nThe E-Commerce Team", firstName);
        sendEmail(to, subject, body);
    }

    public void sendOrderConfirmationEmail(String to, String orderNumber) {
        String subject = "Order Confirmation - " + orderNumber;
        String body = String.format("Your order %s has been confirmed and is now being processed.\n\nThank you for shopping with us!", orderNumber);
        sendEmail(to, subject, body);
    }

    public void sendPaymentFailedEmail(String to, String orderNumber) {
        String subject = "Payment Failed - Order " + orderNumber;
        String body = String.format("We were unable to process the payment for your order %s. Please update your payment method to complete the purchase.", orderNumber);
        sendEmail(to, subject, body);
    }

    private void sendEmail(String to, String subject, String text) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);

            mailSender.send(message);
            log.info("Email sent successfully to: {} with subject: '{}'", to, subject);
        } catch (Exception e) {
            log.error("Failed to send email to: {} with subject: '{}'", to, subject, e);
            throw new RuntimeException("Email delivery failed", e); // Will trigger DLQ/Retry mechanism
        }
    }
}
