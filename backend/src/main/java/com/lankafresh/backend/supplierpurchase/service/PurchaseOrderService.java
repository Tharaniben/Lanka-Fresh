package com.lankafresh.backend.supplierpurchase.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.lankafresh.backend.config.ResourceNotFoundException;
import com.lankafresh.backend.productinventory.model.Product;
import com.lankafresh.backend.productinventory.model.StockResponseDto;
import com.lankafresh.backend.productinventory.model.StockUpdateRequestDto;
import com.lankafresh.backend.productinventory.repository.ProductRepository;
import com.lankafresh.backend.productinventory.service.StockService;
import com.lankafresh.backend.supplierpurchase.event.PurchaseOrderStatusChangedEvent;
import com.lankafresh.backend.supplierpurchase.model.PurchaseOrder;
import com.lankafresh.backend.supplierpurchase.model.PurchaseOrderItem;
import com.lankafresh.backend.supplierpurchase.model.PurchaseOrderStatus;
import com.lankafresh.backend.supplierpurchase.model.Supplier;
import com.lankafresh.backend.supplierpurchase.repository.PurchaseOrderRepository;
import com.lankafresh.backend.supplierpurchase.repository.SupplierRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PurchaseOrderService {

    
    private final StockService stockService;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final SupplierRepository supplierRepository;
    private final ProductRepository productRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional(readOnly = true)
public List<PurchaseOrder> getAllPurchaseOrders() {
    return purchaseOrderRepository.findAll();
}

@Transactional(readOnly = true)
public PurchaseOrder getPurchaseOrderById(Long id) {
    return purchaseOrderRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Purchase order not found with id: " + id));
}

    public List<PurchaseOrder> getPurchaseOrdersBySupplier(Long supplierId) {
        return purchaseOrderRepository.findBySupplierId(supplierId);
    }

    @Transactional
public PurchaseOrder createPurchaseOrder(PurchaseOrder purchaseOrder) {
    if (purchaseOrder.getSupplier() == null || purchaseOrder.getSupplier().getId() == null) {
        throw new IllegalArgumentException("A supplier id is required to create a purchase order");
    }
    Supplier supplier = supplierRepository.findById(purchaseOrder.getSupplier().getId())
            .orElseThrow(() -> new ResourceNotFoundException(
                    "Supplier not found with id: " + purchaseOrder.getSupplier().getId()));
    purchaseOrder.setSupplier(supplier);

    for (PurchaseOrderItem item : purchaseOrder.getItems()) {
        if (item.getProduct() == null || item.getProduct().getId() == null) {
            throw new IllegalArgumentException("Each item requires a product id");
        }
        Product product = productRepository.findById(item.getProduct().getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Product not found with id: " + item.getProduct().getId()));
        item.setProduct(product);
        item.setProductName(product.getName()); // snapshot, as discussed
        item.setPurchaseOrder(purchaseOrder);
    }

    purchaseOrder.recalculateTotal();
    return purchaseOrderRepository.save(purchaseOrder);
}

    @Transactional
public PurchaseOrder updateStatus(Long id, PurchaseOrderStatus newStatus) {
    if (newStatus == PurchaseOrderStatus.COMPLETED) {
        throw new IllegalArgumentException(
                "Use the confirm-stock endpoint to move an order to COMPLETED - it requires staff to confirm accepted quantities first.");
    }
    PurchaseOrder order = getPurchaseOrderById(id);
    PurchaseOrderStatus previousStatus = order.getStatus();

    order.setStatus(newStatus);
    if (newStatus == PurchaseOrderStatus.RECEIVED) {
        order.setReceivedDate(LocalDateTime.now());
        // Stock is NOT updated here anymore - arriving just means it's
        // physically on-site. Stock only changes once staff confirms via
        // confirmStockReceipt(), after checking quality/quantity.
    }

    PurchaseOrder saved = purchaseOrderRepository.save(order);

    // 🔔 Observer Pattern: Notify all registered observers of the status change
    if (previousStatus != newStatus) {
        eventPublisher.publishEvent(
                new PurchaseOrderStatusChangedEvent(saved, previousStatus, newStatus)
        );
    }

    return saved;
}

// Delegates entirely to Product & Inventory's own StockService - we read
// its current quantity, add what just arrived, and let that module's own
// validated update method do the actual write. We never touch the Stock
// table directly.
@Transactional
public PurchaseOrder confirmStockReceipt(Long id, Map<Long, Integer> acceptedQuantitiesByItemId) {
    PurchaseOrder order = getPurchaseOrderById(id);

    if (order.getStatus() != PurchaseOrderStatus.RECEIVED) {
        throw new IllegalArgumentException(
                "Order must be in RECEIVED status before confirming stock - current status: " + order.getStatus());
    }

    for (PurchaseOrderItem item : order.getItems()) {
        Integer accepted = (acceptedQuantitiesByItemId != null)
                ? acceptedQuantitiesByItemId.get(item.getId())
                : null;
        int acceptedQty = (accepted != null) ? accepted : item.getQuantity();

        if (acceptedQty < 0 || acceptedQty > item.getQuantity()) {
            throw new IllegalArgumentException(
                    "Accepted quantity for item " + item.getId()
                            + " must be between 0 and the ordered quantity (" + item.getQuantity() + ")");
        }

        item.setAcceptedQuantity(acceptedQty);

        if (acceptedQty > 0) {
            Long productId = item.getProduct().getId();
            StockResponseDto currentStock = stockService.getStockByProductId(productId);
            int newQuantity = currentStock.getQuantity() + acceptedQty;

            StockUpdateRequestDto updateRequest = new StockUpdateRequestDto();
            updateRequest.setQuantity(newQuantity);
            stockService.updateStock(productId, updateRequest);
        }
    }

    PurchaseOrderStatus previousStatus = order.getStatus();
    order.setStatus(PurchaseOrderStatus.COMPLETED);
    PurchaseOrder saved = purchaseOrderRepository.save(order);

    if (previousStatus != PurchaseOrderStatus.COMPLETED) {
        eventPublisher.publishEvent(
                new PurchaseOrderStatusChangedEvent(saved, previousStatus, PurchaseOrderStatus.COMPLETED)
        );
    }

    return saved;
}

    public void deletePurchaseOrder(Long id) {
        PurchaseOrder order = getPurchaseOrderById(id);
        purchaseOrderRepository.delete(order);
    }

     public List<PurchaseOrder> searchPurchaseOrders(
            Long supplierId, PurchaseOrderStatus status, String contactPerson,
            LocalDate dateFrom, LocalDate dateTo) {
        LocalDateTime from = (dateFrom != null) ? dateFrom.atStartOfDay() : null;
        LocalDateTime to = (dateTo != null) ? dateTo.atTime(23, 59, 59) : null;
        return purchaseOrderRepository.search(supplierId, status, contactPerson, from, to);
    }
}