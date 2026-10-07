package com.lankafresh.backend.cartorder.controller;

import com.lankafresh.backend.cartorder.model.CheckoutRequestDto;
import com.lankafresh.backend.cartorder.model.OrderResponseDto;
import com.lankafresh.backend.cartorder.model.UpdateOrderStatusRequestDto;
import com.lankafresh.backend.cartorder.service.OrderService;
import com.lankafresh.backend.config.ApiResponse;
import com.lankafresh.backend.config.BaseController;
import com.lankafresh.backend.user.model.Role;
import com.lankafresh.backend.user.model.User;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST endpoints for placing, managing, and viewing orders.
 * Base path: /api/v1/orders
 *
 * POST  /api/v1/orders/checkout       -- turns the current cart into a placed order
 * GET   /api/v1/orders                -- current user's order history, most recent first
 * GET   /api/v1/orders/all            -- staff view: all customer orders
 * GET   /api/v1/orders/{id}           -- single order details
 * PATCH /api/v1/orders/{id}/status    -- staff updates order status
 * PATCH /api/v1/orders/{id}/cancel    -- customer cancels placed order
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
        OrderResponseDto order = orderService.checkout(user.getId(), body);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(order));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<OrderResponseDto>>> getMyOrders(HttpServletRequest request) {
        User user = getCurrentUser(request);
        return ResponseEntity.ok(ApiResponse.success(orderService.getOrderHistory(user.getId())));
    }

    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<OrderResponseDto>>> getAllOrders(HttpServletRequest request) {
        User user = getCurrentUser(request);
        if (!isStaff(user)) {
            throw new AccessDeniedException("Only staff and branch managers can view all orders.");
        }
        return ResponseEntity.ok(ApiResponse.success(orderService.getAllOrders()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderResponseDto>> getOrderById(
            HttpServletRequest request,
            @PathVariable Long id) {
        User user = getCurrentUser(request);
        boolean staff = isStaff(user);
        return ResponseEntity.ok(ApiResponse.success(orderService.getOrderById(user.getId(), id, staff)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<OrderResponseDto>> updateOrderStatus(
            HttpServletRequest request,
            @PathVariable Long id,
            @Valid @RequestBody UpdateOrderStatusRequestDto body) {
        User user = getCurrentUser(request);
        if (!isStaff(user)) {
            throw new AccessDeniedException("Only staff members can update order statuses.");
        }
        OrderResponseDto updated = orderService.updateOrderStatus(id, body.getStatus());
        return ResponseEntity.ok(ApiResponse.success(updated));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<OrderResponseDto>> cancelOrder(
            HttpServletRequest request,
            @PathVariable Long id) {
        User user = getCurrentUser(request);
        OrderResponseDto cancelled = orderService.cancelOrder(user.getId(), id);
        return ResponseEntity.ok(ApiResponse.success(cancelled));
    }

    private boolean isStaff(User user) {
        Role role = user.getRole();
        return role == Role.SALES_STAFF || role == Role.DELIVERY_STAFF || role == Role.BRANCH_MANAGER;
    }
}
