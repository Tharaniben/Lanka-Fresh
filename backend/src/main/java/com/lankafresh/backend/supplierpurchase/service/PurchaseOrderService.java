package com.lankafresh.backend.supplierpurchase.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.lankafresh.backend.config.ResourceNotFoundException;
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

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final SupplierRepository supplierRepository;

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
            item.setPurchaseOrder(purchaseOrder);
        }

        purchaseOrder.recalculateTotal();
        return purchaseOrderRepository.save(purchaseOrder);
    }

    @Transactional
    public PurchaseOrder updateStatus(Long id, PurchaseOrderStatus newStatus) {
        PurchaseOrder order = getPurchaseOrderById(id);
        order.setStatus(newStatus);
        if (newStatus == PurchaseOrderStatus.RECEIVED) {
            order.setReceivedDate(LocalDateTime.now());
        }
        return purchaseOrderRepository.save(order);
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