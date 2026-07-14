package com.ecommerce.notification.client;

import com.ecommerce.common.response.SuccessResponse;
import lombok.Data;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.UUID;

@FeignClient(name = "auth-service", url = "${app.clients.auth-service.url:http://localhost:8081}")
public interface AuthServiceClient {

    @GetMapping("/api/v1/users/{id}")
    SuccessResponse<UserProfileDto> getUserProfile(@PathVariable("id") UUID id);

    @Data
    class UserProfileDto {
        private String email;
        private String firstName;
        private String lastName;
        private String phoneNumber;
    }
}
