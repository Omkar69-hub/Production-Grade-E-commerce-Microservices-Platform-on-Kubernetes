package com.ecommerce.notification.service;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.notification.from-email:noreply@ecommerce.com}")
    private String fromEmail;

    public void sendOrderConfirmationEmail(String toEmail, String orderNumber, BigDecimal totalAmount, String status) {
        try {
            log.info("Composing LUMIÈRE order confirmation email for order #{}, recipient: {}", orderNumber, toEmail);
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, "LUMIÈRE Concierge");
            helper.setTo(toEmail);
            helper.setSubject("LUMIÈRE — Order Confirmation #" + orderNumber);

            String formattedAmount = totalAmount != null ? String.format("₹%,.2f", totalAmount) : "₹0.00";

            String html = """
                <!DOCTYPE html>
                <html>
                <head>
                  <meta charset="utf-8">
                  <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FAF8F5; color: #181816; margin: 0; padding: 40px 20px; }
                    .card { max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #EAE5DC; border-radius: 8px; padding: 40px; box-shadow: 0 4px 24px rgba(0,0,0,0.04); }
                    .header { text-align: center; border-bottom: 1px solid #EAE5DC; padding-bottom: 24px; margin-bottom: 30px; }
                    .brand { font-size: 24px; font-weight: 700; letter-spacing: 0.25em; color: #181816; margin: 0; }
                    .sub-brand { font-size: 11px; letter-spacing: 0.2em; color: #B89758; text-transform: uppercase; margin-top: 6px; }
                    .title { font-size: 20px; font-weight: 700; color: #181816; margin: 0 0 12px 0; }
                    .details-box { background-color: #FAF8F5; border: 1px solid #EAE5DC; border-radius: 6px; padding: 20px; margin: 24px 0; }
                    .row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; }
                    .row:last-child { margin-bottom: 0; }
                    .label { color: #666666; }
                    .value { font-weight: 600; color: #181816; }
                    .badge { display: inline-block; padding: 4px 10px; background-color: #181816; color: #B89758; font-size: 11px; font-weight: 700; border-radius: 4px; letter-spacing: 0.1em; }
                    .footer { text-align: center; font-size: 12px; color: #888888; margin-top: 36px; border-top: 1px solid #EAE5DC; padding-top: 24px; }
                  </style>
                </head>
                <body>
                  <div class="card">
                    <div class="header">
                      <h1 class="brand">LUMIÈRE</h1>
                      <div class="sub-brand">Haute Couture & High-Precision Electronics</div>
                    </div>
                    <h2 class="title">Acquisition Confirmed</h2>
                    <p style="color: #555555; line-height: 1.6; font-size: 15px;">
                      We are honored to confirm that your order <strong>#%s</strong> has been successfully secured in the LUMIÈRE vault. Our atelier has initiated preparation for insured white-glove dispatch.
                    </p>
                    <div class="details-box">
                      <div class="row">
                        <span class="label">Order Reference:</span>
                        <span class="value">#%s</span>
                      </div>
                      <div class="row">
                        <span class="label">Total Investment:</span>
                        <span class="value" style="color: #B89758; font-size: 16px;">%s</span>
                      </div>
                      <div class="row">
                        <span class="label">Status:</span>
                        <span class="badge">%s</span>
                      </div>
                    </div>
                    <p style="color: #666666; font-size: 13px; line-height: 1.6;">
                      You can monitor the live fulfillment trajectory in your Client Dossier on the LUMIÈRE portal at any time.
                    </p>
                    <div class="footer">
                      &copy; LUMIÈRE Maison. All rights reserved.<br/>
                      Microservices Platform • Secure Fulfillment Despatch
                    </div>
                  </div>
                </body>
                </html>
                """.formatted(orderNumber, orderNumber, formattedAmount, status != null ? status : "CONFIRMED");

            helper.setText(html, true);
            mailSender.send(message);
            log.info("LUMIÈRE confirmation email successfully dispatched via SMTP for order #{}", orderNumber);
        } catch (Exception e) {
            log.error("Failed to transmit email notification for order #{}: {}", orderNumber, e.getMessage(), e);
        }
    }
}
