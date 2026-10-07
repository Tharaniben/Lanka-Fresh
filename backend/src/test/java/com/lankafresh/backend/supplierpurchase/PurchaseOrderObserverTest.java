package com.lankafresh.backend.supplierpurchase;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import com.lankafresh.backend.productinventory.repository.ProductRepository;
import com.lankafresh.backend.productinventory.service.StockService;
import com.lankafresh.backend.supplierpurchase.event.PurchaseOrderStatusChangedEvent;
import com.lankafresh.backend.supplierpurchase.model.PurchaseOrder;
import com.lankafresh.backend.supplierpurchase.model.PurchaseOrderItem;
import com.lankafresh.backend.supplierpurchase.model.PurchaseOrderStatus;
import com.lankafresh.backend.supplierpurchase.model.Supplier;
import com.lankafresh.backend.supplierpurchase.observer.PurchaseOrderAuditObserver;
import com.lankafresh.backend.supplierpurchase.observer.PurchaseOrderNotificationObserver;
import com.lankafresh.backend.supplierpurchase.observer.PurchaseOrderStockObserver;
import com.lankafresh.backend.supplierpurchase.repository.PurchaseOrderRepository;
import com.lankafresh.backend.supplierpurchase.repository.SupplierRepository;

@ExtendWith(MockitoExtension.class)
class PurchaseOrderObserverTest {

    @Mock
    private StockService stockService;

    @Mock
    private PurchaseOrderRepository purchaseOrderRepository;

    @Mock
    private SupplierRepository supplierRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private com.lankafresh.backend.supplierpurchase.service.PurchaseOrderService purchaseOrderService;

    private PurchaseOrder sampleOrder;
    private Supplier sampleSupplier;

    @BeforeEach
    void setUp() {
        sampleSupplier = new Supplier();
        sampleSupplier.setId(1L);
        sampleSupplier.setName("Ceylon Fresh Foods");

        sampleOrder = new PurchaseOrder();
        sampleOrder.setId(101L);
        sampleOrder.setStatus(PurchaseOrderStatus.DRAFT);
        sampleOrder.setSupplier(sampleSupplier);
        sampleOrder.setItems(new ArrayList<>());
    }

    @Test
    @DisplayName("Subject notifies observers via ApplicationEventPublisher on status change")
    void shouldPublishEventWhenStatusChanges() {
        when(purchaseOrderRepository.findById(101L)).thenReturn(Optional.of(sampleOrder));
        when(purchaseOrderRepository.save(any(PurchaseOrder.class))).thenAnswer(invocation -> invocation.getArgument(0));

        PurchaseOrder updated = purchaseOrderService.updateStatus(101L, PurchaseOrderStatus.SENT);

        assertEquals(PurchaseOrderStatus.SENT, updated.getStatus());

        ArgumentCaptor<PurchaseOrderStatusChangedEvent> eventCaptor =
                ArgumentCaptor.forClass(PurchaseOrderStatusChangedEvent.class);
        verify(eventPublisher, times(1)).publishEvent(eventCaptor.capture());

        PurchaseOrderStatusChangedEvent event = eventCaptor.getValue();
        assertEquals(101L, event.getPurchaseOrderId());
        assertEquals(PurchaseOrderStatus.DRAFT, event.getPreviousStatus());
        assertEquals(PurchaseOrderStatus.SENT, event.getNewStatus());
        assertEquals("Ceylon Fresh Foods", event.getSupplierName());
        assertNotNull(event.getTimestamp());
    }

    @Test
    @DisplayName("Subject does not publish event if status remains identical")
    void shouldNotPublishEventWhenStatusUnchanged() {
        sampleOrder.setStatus(PurchaseOrderStatus.SENT);
        when(purchaseOrderRepository.findById(101L)).thenReturn(Optional.of(sampleOrder));
        when(purchaseOrderRepository.save(any(PurchaseOrder.class))).thenAnswer(invocation -> invocation.getArgument(0));

        purchaseOrderService.updateStatus(101L, PurchaseOrderStatus.SENT);

        verify(eventPublisher, never()).publishEvent(any());
    }

    @Test
    @DisplayName("StockObserver reacts when PO is RECEIVED and items exist")
    void testStockObserver() {
        PurchaseOrderItem item = new PurchaseOrderItem();
        item.setProductName("Organic Avocados");
        item.setQuantity(50);
        sampleOrder.getItems().add(item);

        PurchaseOrderStatusChangedEvent event =
                new PurchaseOrderStatusChangedEvent(sampleOrder, PurchaseOrderStatus.SENT, PurchaseOrderStatus.RECEIVED);

        PurchaseOrderStockObserver stockObserver = new PurchaseOrderStockObserver();
        assertDoesNotThrow(() -> stockObserver.onPurchaseOrderStatusChanged(event));
    }

    @Test
    @DisplayName("NotificationObserver handles RECEIVED, SENT, and CANCELLED states")
    void testNotificationObserver() {
        PurchaseOrderNotificationObserver notificationObserver = new PurchaseOrderNotificationObserver();

        PurchaseOrderStatusChangedEvent receivedEvent =
                new PurchaseOrderStatusChangedEvent(sampleOrder, PurchaseOrderStatus.SENT, PurchaseOrderStatus.RECEIVED);
        PurchaseOrderStatusChangedEvent sentEvent =
                new PurchaseOrderStatusChangedEvent(sampleOrder, PurchaseOrderStatus.DRAFT, PurchaseOrderStatus.SENT);
        PurchaseOrderStatusChangedEvent cancelledEvent =
                new PurchaseOrderStatusChangedEvent(sampleOrder, PurchaseOrderStatus.SENT, PurchaseOrderStatus.CANCELLED);

        assertDoesNotThrow(() -> notificationObserver.onPurchaseOrderStatusChanged(receivedEvent));
        assertDoesNotThrow(() -> notificationObserver.onPurchaseOrderStatusChanged(sentEvent));
        assertDoesNotThrow(() -> notificationObserver.onPurchaseOrderStatusChanged(cancelledEvent));
    }

    @Test
    @DisplayName("AuditObserver logs state transitions with timestamp")
    void testAuditObserver() {
        PurchaseOrderAuditObserver auditObserver = new PurchaseOrderAuditObserver();
        PurchaseOrderStatusChangedEvent event =
                new PurchaseOrderStatusChangedEvent(sampleOrder, PurchaseOrderStatus.DRAFT, PurchaseOrderStatus.SENT);

        assertDoesNotThrow(() -> auditObserver.onPurchaseOrderStatusChanged(event));
    }
}
