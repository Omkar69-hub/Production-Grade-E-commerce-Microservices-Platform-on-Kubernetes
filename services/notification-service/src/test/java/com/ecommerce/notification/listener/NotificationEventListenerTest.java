package com.ecommerce.notification.listener;

import com.ecommerce.common.response.SuccessResponse;
import com.ecommerce.notification.client.AuthServiceClient;
import com.ecommerce.notification.event.OrderStatusEvent;
import com.ecommerce.notification.event.UserRegisteredEvent;
import com.ecommerce.notification.service.EmailNotificationService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationEventListenerTest {

    @Mock
    private EmailNotificationService emailNotificationService;

    @Mock
    private AuthServiceClient authServiceClient;

    @InjectMocks
    private NotificationEventListener listener;

    @Test
    void shouldHandleUserRegisteredEvent() {
        UserRegisteredEvent event = UserRegisteredEvent.builder()
                .userId(UUID.randomUUID())
                .email("test@example.com")
                .firstName("John")
                .build();

        listener.handleUserRegistered(event);

        verify(emailNotificationService, times(1)).sendWelcomeEmail("test@example.com", "John");
    }

    @Test
    void shouldHandleOrderStatusEvent_Confirmed() {
        UUID userId = UUID.randomUUID();
        OrderStatusEvent event = OrderStatusEvent.builder()
                .userId(userId)
                .orderId(UUID.randomUUID())
                .orderNumber("ORD-123")
                .status("CONFIRMED")
                .build();

        AuthServiceClient.UserProfileDto profile = new AuthServiceClient.UserProfileDto();
        profile.setEmail("customer@example.com");
        
        when(authServiceClient.getUserProfile(userId)).thenReturn(SuccessResponse.<AuthServiceClient.UserProfileDto>builder().data(profile).build());

        listener.handleOrderStatusChange(event);

        verify(emailNotificationService, times(1)).sendOrderConfirmationEmail("customer@example.com", "ORD-123");
    }

    @Test
    void shouldHandleOrderStatusEvent_Cancelled() {
        UUID userId = UUID.randomUUID();
        OrderStatusEvent event = OrderStatusEvent.builder()
                .userId(userId)
                .orderId(UUID.randomUUID())
                .orderNumber("ORD-123")
                .status("CANCELLED")
                .build();

        AuthServiceClient.UserProfileDto profile = new AuthServiceClient.UserProfileDto();
        profile.setEmail("customer@example.com");
        
        when(authServiceClient.getUserProfile(userId)).thenReturn(SuccessResponse.<AuthServiceClient.UserProfileDto>builder().data(profile).build());

        listener.handleOrderStatusChange(event);

        verify(emailNotificationService, times(1)).sendPaymentFailedEmail("customer@example.com", "ORD-123");
    }
}
