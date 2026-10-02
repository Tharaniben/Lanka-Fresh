package com.lankafresh.backend.deliverymanagement.controller;

import com.lankafresh.backend.config.ApiResponse; // shared wrapper built by Tharaniben — see PRD 4.10
import com.lankafresh.backend.deliverymanagement.dto.AssignDeliveryRequestDto;
import com.lankafresh.backend.deliverymanagement.dto.DeliveryAssignmentResponseDto;
import com.lankafresh.backend.deliverymanagement.dto.DeliveryResponseDto;
import com.lankafresh.backend.deliverymanagement.dto.UpdateDeliveryAddressRequestDto;
import com.lankafresh.backend.deliverymanagement.dto.UpdateDeliveryStatusRequestDto;
import com.lankafresh.backend.deliverymanagement.service.DeliveryService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Base path per PRD 4.5: /api/v1/{module} -> /api/v1/deliveries
 *
 * Role gating (@PreAuthorize for DELIVERY_STAFF / CUSTOMER / etc.) is added
 * once the shared role-check piece in config/ is finished — see PRD 4.4.
 * Left as TODO comments below rather than guessed at, so nothing here
 * silently disagrees with how Tharaniben wires it.
 */
@RestController
@RequestMapping("/api/v1/deliveries")
public class DeliveryController {

    private final DeliveryService deliveryService;

    public DeliveryController(DeliveryService deliveryService) {
        this.deliveryService = deliveryService;
    }

    // TODO: @PreAuthorize("hasRole('DELIVERY_STAFF')")
    // Master registry — backs the "All Deliveries" staff view and the
    // stats row. Never returns a way to delete a Delivery row; the PRD is
    // explicit that Delivery only gets Update, never Delete.
    @GetMapping
    public ResponseEntity<ApiResponse<List<DeliveryResponseDto>>> getAllDeliveries() {
        List<DeliveryResponseDto> deliveries = deliveryService.getAllDeliveries();
        return ResponseEntity.ok(ApiResponse.success(deliveries));
    }

    // TODO: @PreAuthorize("hasRole('DELIVERY_STAFF')") once role checks are wired in config/
    @GetMapping("/unassigned")
    public ResponseEntity<ApiResponse<List<DeliveryResponseDto>>> getUnassignedDeliveries() {
        List<DeliveryResponseDto> deliveries = deliveryService.getUnassignedDeliveries();
        return ResponseEntity.ok(ApiResponse.success(deliveries));
    }

    // TODO: @PreAuthorize("hasRole('DELIVERY_STAFF')")
    // agentUserId as a request param for now — swap for the authenticated
    // user's id once the shared auth helper exposes it (PRD 4.4).
    @GetMapping("/assigned")
    public ResponseEntity<ApiResponse<List<DeliveryResponseDto>>> getAssignedDeliveries(
            @RequestParam Long agentUserId) {
        List<DeliveryResponseDto> deliveries = deliveryService.getDeliveriesAssignedToAgent(agentUserId);
        return ResponseEntity.ok(ApiResponse.success(deliveries));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DeliveryResponseDto>> getDeliveryById(@PathVariable Long id) {
        try {
            DeliveryResponseDto dto = deliveryService.getDeliveryById(id);
            return ResponseEntity.ok(ApiResponse.success(dto));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(ApiResponse.error(e.getMessage()));
        }
    }

    // Used by Order Mgmt's order-status view (PRD 5.4 "Depends on / is
    // depended on by"), and by the customer-facing tracking screen.
    @GetMapping("/order/{orderId}")
    public ResponseEntity<ApiResponse<DeliveryResponseDto>> getDeliveryByOrderId(@PathVariable Long orderId) {
        try {
            DeliveryResponseDto dto = deliveryService.getDeliveryByOrderId(orderId);
            return ResponseEntity.ok(ApiResponse.success(dto));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(ApiResponse.error(e.getMessage()));
        }
    }

    // TODO: @PreAuthorize("hasRole('DELIVERY_STAFF')")
    @PostMapping("/{id}/assign")
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

    // TODO: @PreAuthorize("hasRole('DELIVERY_STAFF')")
    @PatchMapping("/{id}/status")
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

    // TODO: @PreAuthorize("hasRole('DELIVERY_STAFF')")
    // This is the module's Delete — it removes the DeliveryAssignment
    // (unassigns the agent), never the Delivery row itself. Supports
    // PRD 5.4's "Delete/cancel if order is cancelled before pickup"
    // behaviour on DeliveryAssignment specifically. Frontend should label
    // the button "Unassign", not "Delete", to avoid implying a Delivery
    // record gets removed.
    @DeleteMapping("/{id}/assignment")
    public ResponseEntity<ApiResponse<Void>> cancelAssignment(@PathVariable Long id) {
        try {
            deliveryService.cancelAssignment(id);
            return ResponseEntity.ok(ApiResponse.success(null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(ApiResponse.error(e.getMessage()));
        }
    }

    // TODO: @PreAuthorize("hasRole('DELIVERY_STAFF')")
    // Not in PRD 5.4's illustrative endpoint list — added to support the
    // "Edit Address" action on the All Deliveries screen. Still an Update
    // on the existing Delivery row, so it stays within the CRUD boundary
    // PRD 5.4 sets.
    @PatchMapping("/{id}/address")
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
