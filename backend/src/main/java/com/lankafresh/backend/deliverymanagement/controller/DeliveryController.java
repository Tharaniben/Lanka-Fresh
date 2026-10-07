package com.lankafresh.backend.deliverymanagement.controller;

import com.lankafresh.backend.config.ApiResponse;
import com.lankafresh.backend.deliverymanagement.dto.AssignDeliveryRequestDto;
import com.lankafresh.backend.deliverymanagement.dto.DeliveryAssignmentResponseDto;
import com.lankafresh.backend.deliverymanagement.dto.DeliveryResponseDto;
import com.lankafresh.backend.deliverymanagement.dto.UpdateDeliveryAddressRequestDto;
import com.lankafresh.backend.deliverymanagement.dto.UpdateDeliveryStatusRequestDto;
import com.lankafresh.backend.deliverymanagement.service.DeliveryService;
import com.lankafresh.backend.user.model.Role;
import com.lankafresh.backend.user.model.User;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST endpoints for Delivery Management (PRD 5.4).
 * Base path: /api/v1/deliveries
 */
@RestController
@RequestMapping("/api/v1/deliveries")
public class DeliveryController {

    private final DeliveryService deliveryService;

    public DeliveryController(DeliveryService deliveryService) {
        this.deliveryService = deliveryService;
    }

    /** Master registry — backs the "All Deliveries" manager view. */
    @GetMapping
    @PreAuthorize("hasRole('BRANCH_MANAGER')")
    public ResponseEntity<ApiResponse<List<DeliveryResponseDto>>> getAllDeliveries() {
        List<DeliveryResponseDto> deliveries = deliveryService.getAllDeliveries();
        return ResponseEntity.ok(ApiResponse.success(deliveries));
    }

    /** Accessible by customers and staff to populate the tracking order dropdown.
     * Managers get every customer's order.
     * Customers only get their own orders.
     */
    @GetMapping("/trackable-orders")
    public ResponseEntity<ApiResponse<List<DeliveryResponseDto>>> getTrackableOrders(
            HttpServletRequest request) {
        User currentUser = (User) request.getAttribute("currentUser");
        if (currentUser != null && currentUser.getRole() == Role.CUSTOMER) {
            List<DeliveryResponseDto> customerOrders = deliveryService.getDeliveriesForCustomer(currentUser.getId());
            return ResponseEntity.ok(ApiResponse.success(customerOrders));
        }
        // Branch Manager (and staff) get every customer's order
        List<DeliveryResponseDto> allDeliveries = deliveryService.getAllDeliveries();
        return ResponseEntity.ok(ApiResponse.success(allDeliveries));
    }

    /** Deliveries waiting to be picked up. */
    @GetMapping("/unassigned")
    @PreAuthorize("hasRole('BRANCH_MANAGER')")
    public ResponseEntity<ApiResponse<List<DeliveryResponseDto>>> getUnassignedDeliveries() {
        List<DeliveryResponseDto> deliveries = deliveryService.getUnassignedDeliveries();
        return ResponseEntity.ok(ApiResponse.success(deliveries));
    }

    /** Assigned deliveries for a specific agent. */
    @GetMapping("/assigned")
    @PreAuthorize("hasAnyRole('DELIVERY_STAFF', 'BRANCH_MANAGER')")
    public ResponseEntity<ApiResponse<List<DeliveryResponseDto>>> getAssignedDeliveries(
            @RequestParam Long agentUserId) {
        List<DeliveryResponseDto> deliveries = deliveryService.getDeliveriesAssignedToAgent(agentUserId);
        return ResponseEntity.ok(ApiResponse.success(deliveries));
    }

    /** Look up delivery by delivery ID. */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DeliveryResponseDto>> getDeliveryById(@PathVariable Long id) {
        try {
            DeliveryResponseDto dto = deliveryService.getDeliveryById(id);
            return ResponseEntity.ok(ApiResponse.success(dto));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(ApiResponse.error(e.getMessage()));
        }
    }

    /** Look up delivery by order ID (used by Customer tracking & Order Management). */
    @GetMapping("/order/{orderId}")
    public ResponseEntity<ApiResponse<DeliveryResponseDto>> getDeliveryByOrderId(@PathVariable Long orderId) {
        try {
            DeliveryResponseDto dto = deliveryService.getDeliveryByOrderId(orderId);
            return ResponseEntity.ok(ApiResponse.success(dto));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(ApiResponse.error(e.getMessage()));
        }
    }

    /** Assign delivery to an agent (Branch Manager only). */
    @PostMapping("/{id}/assign")
    @PreAuthorize("hasRole('BRANCH_MANAGER')")
    public ResponseEntity<ApiResponse<DeliveryAssignmentResponseDto>> assignDelivery(
            @PathVariable Long id,
            @Valid @RequestBody AssignDeliveryRequestDto request) {
        try {
            DeliveryAssignmentResponseDto dto = deliveryService.assignDelivery(id, request.getAgentUserId());
            return ResponseEntity.ok(ApiResponse.success(dto));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(ApiResponse.error(e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(400).body(ApiResponse.error(e.getMessage()));
        }
    }

    /** Update delivery lifecycle status (ORDER_PLACED -> ASSIGNED -> OUT_FOR_DELIVERY -> DELIVERED). */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('DELIVERY_STAFF', 'BRANCH_MANAGER')")
    public ResponseEntity<ApiResponse<DeliveryResponseDto>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateDeliveryStatusRequestDto request) {
        try {
            DeliveryResponseDto dto = deliveryService.updateDeliveryStatus(id, request.getStatus());
            return ResponseEntity.ok(ApiResponse.success(dto));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(ApiResponse.error(e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(400).body(ApiResponse.error(e.getMessage()));
        }
    }

    /** Unassign agent / cancel assignment before pickup (Branch Manager only). */
    @DeleteMapping("/{id}/assignment")
    @PreAuthorize("hasRole('BRANCH_MANAGER')")
    public ResponseEntity<ApiResponse<Void>> cancelAssignment(@PathVariable Long id) {
        try {
            deliveryService.cancelAssignment(id);
            return ResponseEntity.ok(ApiResponse.success(null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(ApiResponse.error(e.getMessage()));
        }
    }

    /** Edit delivery destination address (Branch Manager only). */
    @PatchMapping("/{id}/address")
    @PreAuthorize("hasRole('BRANCH_MANAGER')")
    public ResponseEntity<ApiResponse<DeliveryResponseDto>> updateAddress(
            @PathVariable Long id,
            @Valid @RequestBody UpdateDeliveryAddressRequestDto request) {
        try {
            DeliveryResponseDto dto = deliveryService.updateDeliveryAddress(id, request.getDeliveryAddress());
            return ResponseEntity.ok(ApiResponse.success(dto));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(ApiResponse.error(e.getMessage()));
        }
    }
}
