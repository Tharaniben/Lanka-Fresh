package com.lankafresh.backend.supplierpurchase.event;

import com.lankafresh.backend.supplierpurchase.model.PurchaseOrder;
import com.lankafresh.backend.supplierpurchase.model.PurchaseOrderStatus;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * Event payload carrying state transition details for the Observer pattern.
 */
@Getter
public class PurchaseOrderStatusChangedEvent {

    private final Long purchaseOrderId;
    private final PurchaseOrderStatus previousStatus;
    private final PurchaseOrderStatus newStatus;
    private final String supplierName;
    private final PurchaseOrder purchaseOrder;
    private final LocalDateTime timestamp;

    public PurchaseOrderStatusChangedEvent(PurchaseOrder purchaseOrder, 
                                           PurchaseOrderStatus previousStatus, 
                                           PurchaseOrderStatus newStatus) {
        this.purchaseOrderId = purchaseOrder.getId();
        this.previousStatus = previousStatus;
        this.newStatus = newStatus;
        this.supplierName = (purchaseOrder.getSupplier() != null && purchaseOrder.getSupplier().getName() != null) 
                            ? purchaseOrder.getSupplier().getName() 
                            : "Unknown Supplier";
        this.purchaseOrder = purchaseOrder;
        this.timestamp = LocalDateTime.now();
    }
}
