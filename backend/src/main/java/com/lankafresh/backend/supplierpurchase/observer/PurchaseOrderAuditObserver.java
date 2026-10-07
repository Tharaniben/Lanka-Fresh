package com.lankafresh.backend.supplierpurchase.observer;

import com.lankafresh.backend.supplierpurchase.event.PurchaseOrderStatusChangedEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

/**
 * Observer 3: Maintains an immutable audit log of status transitions.
 */
@Component
@Slf4j
public class PurchaseOrderAuditObserver {

    @EventListener
    public void onPurchaseOrderStatusChanged(PurchaseOrderStatusChangedEvent event) {
        log.info("📝 [AuditObserver] AUDIT LOG: PO #{} transition [{} -> {}] recorded at {}",
                event.getPurchaseOrderId(),
                event.getPreviousStatus(),
                event.getNewStatus(),
                event.getTimestamp());
    }
}
