package com.lankafresh.backend.cartorder.controller;

import com.lankafresh.backend.cartorder.model.CheckoutRequestDto;
import com.lankafresh.backend.cartorder.model.OrderResponseDto;
import com.lankafresh.backend.cartorder.service.OrderService;
import com.lankafresh.backend.config.ApiResponse;
import com.lankafresh.backend.config.BaseController;
import com.lankafresh.backend.user.model.User;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST endpoints for placing and viewing orders.
 * Base path: /api/v1/orders
 *
 * POST /api/v1/orders/checkout -- turns the current cart into a placed order
 * GET  /api/v1/orders          -- this user's order history, most recent first
 * GET  /api/v1/orders/{id}     -- a single order (must belong to the current user)
 */
@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController extends BaseController {

    private final OrderService orderService;

    @PostMapping("/checkout")
    public ResponseEntity<ApiResponse<OrderResponseDto>> checkout(
            HttpServletRequest request,
            @Valid @RequestBody CheckoutRequestDto body) {
        User user = getCurrentUser(request);
        OrderResponseDto order = orderService.checkout(user.getId(), body.getDeliveryAddress());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(order));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<OrderResponseDto>>> getMyOrders(HttpServletRequest request) {
        User user = getCurrentUser(request);
        return ResponseEntity.ok(ApiResponse.success(orderService.getOrderHistory(user.getId())));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderResponseDto>> getOrderById(
            HttpServletRequest request,
            @PathVariable Long id) {
        User user = getCurrentUser(request);
        return ResponseEntity.ok(ApiResponse.success(orderService.getOrderById(user.getId(), id)));
    }
}
