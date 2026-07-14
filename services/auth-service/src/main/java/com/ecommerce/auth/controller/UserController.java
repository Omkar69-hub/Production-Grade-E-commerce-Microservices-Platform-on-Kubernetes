package com.ecommerce.auth.controller;

import com.ecommerce.auth.dto.ChangePasswordRequest;
import com.ecommerce.auth.dto.UpdateProfileRequest;
import com.ecommerce.auth.dto.UserResponse;
import com.ecommerce.auth.service.UserService;
import com.ecommerce.common.exception.UnauthorizedException;
import com.ecommerce.common.response.SuccessResponse;
import com.ecommerce.common.util.SecurityUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<SuccessResponse<UserResponse>> getCurrentUser() {
        String userId = SecurityUtil.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("User not authenticated"));
        
        UserResponse response = userService.getUserProfile(userId);
        
        return ResponseEntity.ok(SuccessResponse.<UserResponse>builder()
                .data(response)
                .message("Profile retrieved successfully")
                .build());
    }

    @PutMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<SuccessResponse<Void>> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        // Implementation...
        return ResponseEntity.ok(SuccessResponse.<Void>builder().message("Profile updated successfully").build());
    }

    @PutMapping("/change-password")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<SuccessResponse<Void>> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        String userId = SecurityUtil.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("User not authenticated"));

        userService.changePassword(userId, request);

        return ResponseEntity.ok(SuccessResponse.<Void>builder().message("Password changed successfully").build());
    }
}
