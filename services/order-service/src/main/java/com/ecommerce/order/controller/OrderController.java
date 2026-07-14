package com.ecommerce.order.controller;

import com.ecommerce.common.constants.ApplicationConstants;
import com.ecommerce.common.dto.PageResponse;
import com.ecommerce.common.dto.PaginationDto;
import com.ecommerce.common.exception.UnauthorizedException;
import com.ecommerce.common.response.SuccessResponse;
import com.ecommerce.common.util.SecurityUtil;
import com.ecommerce.order.dto.OrderRequest;
import com.ecommerce.order.dto.OrderResponse;
import com.ecommerce.order.service.OrderService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @GetMapping
    public ResponseEntity<SuccessResponse<PageResponse<OrderResponse>>> getUserOrders(@Valid PaginationDto pagination) {
        UUID userId = getCurrentUserId();
        PageResponse<OrderResponse> response = orderService.getUserOrders(userId, pagination);
        
        return ResponseEntity.ok(SuccessResponse.<PageResponse<OrderResponse>>builder()
                .data(response)
                .message("Orders retrieved successfully")
                .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SuccessResponse<OrderResponse>> getOrder(@PathVariable UUID id) {
        UUID userId = getCurrentUserId();
        OrderResponse response = orderService.getOrder(userId, id);
        
        return ResponseEntity.ok(SuccessResponse.<OrderResponse>builder()
                .data(response)
                .message("Order retrieved successfully")
                .build());
    }

    @PostMapping
    public ResponseEntity<SuccessResponse<OrderResponse>> createOrder(
            @Valid @RequestBody OrderRequest request,
            HttpServletRequest httpRequest) {
        
        UUID userId = getCurrentUserId();
        String token = extractToken(httpRequest);
        
        OrderResponse response = orderService.createOrder(userId, token, request);
        
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(SuccessResponse.<OrderResponse>builder()
                        .data(response)
                        .message("Order created successfully")
                        .build());
    }

    private UUID getCurrentUserId() {
        return UUID.fromString(SecurityUtil.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("User must be authenticated to access orders")));
    }

    private String extractToken(HttpServletRequest request) {
        String authHeader = request.getHeader(ApplicationConstants.AUTHORIZATION_HEADER);
        if (authHeader != null && authHeader.startsWith(ApplicationConstants.BEARER_PREFIX)) {
            return authHeader.substring(7);
        }
        throw new UnauthorizedException("Missing Authorization header for downstream service calls");
    }
}
