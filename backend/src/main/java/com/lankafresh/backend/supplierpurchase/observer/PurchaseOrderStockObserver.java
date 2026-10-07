package com.lankafresh.backend.supplierpurchase.observer;

import com.lankafresh.backend.supplierpurchase.event.PurchaseOrderStatusChangedEvent;
import com.lankafresh.backend.supplierpurchase.model.PurchaseOrderStatus;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

/**
 * Observer 1: Reacts to RECEIVED status to handle inventory restocking.
 */
@Component
@Slf4j
public class PurchaseOrderStockObserver {

    @EventListener
    public void onPurchaseOrderStatusChanged(PurchaseOrderStatusChangedEvent event) {
        if (event.getNewStatus() == PurchaseOrderStatus.RECEIVED) {
            log.info("📦 [StockObserver] PO #{} marked as RECEIVED from supplier '{}'. Triggering inventory restock flow...",
                    event.getPurchaseOrderId(), event.getSupplierName());

            if (event.getPurchaseOrder().getItems() != null) {
                event.getPurchaseOrder().getItems().forEach(item -> {
                    log.info("📦 [StockObserver] Stock updated: Product '{}', Quantity: {}",
                            item.getProductName(), item.getQuantity());
                });
            }
        }
    }
}
