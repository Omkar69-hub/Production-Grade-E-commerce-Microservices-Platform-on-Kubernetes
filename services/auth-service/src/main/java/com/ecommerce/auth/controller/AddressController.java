package com.ecommerce.auth.controller;

import com.ecommerce.auth.dto.AddressRequest;
import com.ecommerce.auth.dto.AddressResponse;
import com.ecommerce.auth.service.AddressService;
import com.ecommerce.common.exception.UnauthorizedException;
import com.ecommerce.common.response.SuccessResponse;
import com.ecommerce.common.util.SecurityUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/auth/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<SuccessResponse<List<AddressResponse>>> getAddresses() {
        UUID userId = getCurrentUserId();
        List<AddressResponse> addresses = addressService.getUserAddresses(userId);
        return ResponseEntity.ok(SuccessResponse.<List<AddressResponse>>builder()
                .data(addresses)
                .message("Addresses retrieved successfully")
                .build());
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<SuccessResponse<AddressResponse>> getAddress(@PathVariable UUID id) {
        UUID userId = getCurrentUserId();
        AddressResponse address = addressService.getAddressById(userId, id);
        return ResponseEntity.ok(SuccessResponse.<AddressResponse>builder()
                .data(address)
                .message("Address retrieved successfully")
                .build());
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<SuccessResponse<AddressResponse>> createAddress(@Valid @RequestBody AddressRequest request) {
        UUID userId = getCurrentUserId();
        AddressResponse address = addressService.createAddress(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(SuccessResponse.<AddressResponse>builder()
                        .data(address)
                        .message("Address created successfully")
                        .build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<SuccessResponse<AddressResponse>> updateAddress(
            @PathVariable UUID id,
            @Valid @RequestBody AddressRequest request) {
        UUID userId = getCurrentUserId();
        AddressResponse address = addressService.updateAddress(userId, id, request);
        return ResponseEntity.ok(SuccessResponse.<AddressResponse>builder()
                .data(address)
                .message("Address updated successfully")
                .build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<SuccessResponse<Void>> deleteAddress(@PathVariable UUID id) {
        UUID userId = getCurrentUserId();
        addressService.deleteAddress(userId, id);
        return ResponseEntity.ok(SuccessResponse.<Void>builder()
                .message("Address deleted successfully")
                .build());
    }

    @PatchMapping("/{id}/default")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<SuccessResponse<AddressResponse>> setDefaultAddress(@PathVariable UUID id) {
        UUID userId = getCurrentUserId();
        AddressResponse address = addressService.setDefaultAddress(userId, id);
        return ResponseEntity.ok(SuccessResponse.<AddressResponse>builder()
                .data(address)
                .message("Default address updated successfully")
                .build());
    }

    private UUID getCurrentUserId() {
        return UUID.fromString(SecurityUtil.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("User not authenticated")));
    }
}
