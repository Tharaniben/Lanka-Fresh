package com.lankafresh.backend.supplierpurchase.observer;

import com.lankafresh.backend.supplierpurchase.event.PurchaseOrderStatusChangedEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

/**
 * Observer 2: Generates alerts and notifications for staff upon state transitions.
 */
@Component
@Slf4j
public class PurchaseOrderNotificationObserver {

    @EventListener
    public void onPurchaseOrderStatusChanged(PurchaseOrderStatusChangedEvent event) {
        switch (event.getNewStatus()) {
            case RECEIVED -> log.info("🔔 [NotificationObserver] ALERT: Shipment for PO #{} has successfully arrived.", 
                    event.getPurchaseOrderId());
            case SENT -> log.info("🔔 [NotificationObserver] NOTICE: PO #{} sent to supplier '{}'.", 
                    event.getPurchaseOrderId(), event.getSupplierName());
            case CANCELLED -> log.warn("🔔 [NotificationObserver] WARNING: PO #{} has been CANCELLED.", 
                    event.getPurchaseOrderId());
            default -> {}
        }
    }
}
