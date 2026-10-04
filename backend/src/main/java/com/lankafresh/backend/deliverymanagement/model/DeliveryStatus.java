package com.lankafresh.backend.deliverymanagement.model;

/**
 * Delivery status lifecycle, per PRD Section 5.4:
 *
 *   ORDER_PLACED -> ASSIGNED -> OUT_FOR_DELIVERY -> DELIVERED
 *
 * CANCELLED is an addition beyond the PRD's 4-state lifecycle, needed to
 * support the "DeliveryAssignment deleted/cancelled if order is cancelled
 * before pickup" case from the entity table in Section 5.4. Flag in the
 * group chat if the team wants this formalised differently.
 */
public enum DeliveryStatus {
    ORDER_PLACED,
    ASSIGNED,
    OUT_FOR_DELIVERY,
    DELIVERED,
    CANCELLED
}
