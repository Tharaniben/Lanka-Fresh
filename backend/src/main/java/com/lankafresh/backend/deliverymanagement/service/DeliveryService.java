package com.lankafresh.backend.deliverymanagement.service;

import com.lankafresh.backend.deliverymanagement.dto.DeliveryAssignmentResponseDto;
import com.lankafresh.backend.deliverymanagement.dto.DeliveryResponseDto;
import com.lankafresh.backend.deliverymanagement.model.DeliveryStatus;

import java.util.List;

public interface DeliveryService {

    /**
     * Called by Cart & Order Mgmt on order confirmation, per PRD 5.4:
     * "a Delivery record is automatically created with status ORDER_PLACED."
     * This is the method Gunasekara's OrderService should inject and call —
     * never let another module create a Delivery row directly.
     */
    DeliveryResponseDto createDeliveryForOrder(Long orderId, String deliveryAddress);

    /**
     * Full delivery registry — backs the "All Deliveries" staff view and
     * the stats row. Not in PRD 5.4's illustrative endpoint list, but it's
     * a plain Read on an entity this module already owns, so it doesn't
     * touch anyone else's module.
     */
    List<DeliveryResponseDto> getAllDeliveries();

    List<DeliveryResponseDto> getUnassignedDeliveries();

    List<DeliveryResponseDto> getDeliveriesAssignedToAgent(Long agentUserId);

    DeliveryResponseDto getDeliveryById(Long deliveryId);

    /**
     * Used by Order Mgmt's order status view to show delivery status to the
     * customer, per PRD 5.4 "Depends on / is depended on by."
     */
    DeliveryResponseDto getDeliveryByOrderId(Long orderId);

    DeliveryAssignmentResponseDto assignDelivery(Long deliveryId, Long agentUserId);

    DeliveryResponseDto updateDeliveryStatus(Long deliveryId, DeliveryStatus newStatus);

    /**
     * Editing the delivery address isn't in PRD 5.4's core feature list —
     * added because the team's UI plan wants it on the "All Deliveries"
     * screen. This still only updates the existing Delivery row (Update,
     * not Delete), so it stays inside the CRUD boundary PRD 5.4 sets:
     * "Update status through lifecycle; no Delete."
     */
    DeliveryResponseDto updateDeliveryAddress(Long deliveryId, String newAddress);

    /**
     * Cancels the active assignment for a delivery — used when an order is
     * cancelled before pickup, per the DeliveryAssignment CRUD note in PRD
     * 5.4's entity table.
     */
    void cancelAssignment(Long deliveryId);
}
