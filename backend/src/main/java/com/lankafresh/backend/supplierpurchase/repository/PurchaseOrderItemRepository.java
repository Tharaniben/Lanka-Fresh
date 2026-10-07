package com.lankafresh.backend.supplierpurchase.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.lankafresh.backend.supplierpurchase.model.PurchaseOrder;
import com.lankafresh.backend.supplierpurchase.model.PurchaseOrderItem;
import com.lankafresh.backend.supplierpurchase.model.PurchaseOrderStatus;

@Repository
public interface PurchaseOrderItemRepository extends JpaRepository<PurchaseOrderItem, Long> {
    

@Query("SELECT po FROM PurchaseOrder po WHERE " +
           "(:supplierId IS NULL OR po.supplier.id = :supplierId) AND " +
           "(:status IS NULL OR po.status = :status) AND " +
           "(:contactPerson IS NULL OR LOWER(po.supplier.contactPerson) LIKE LOWER(CONCAT('%', :contactPerson, '%'))) AND " +
           "(:dateFrom IS NULL OR po.orderDate >= :dateFrom) AND " +
           "(:dateTo IS NULL OR po.orderDate <= :dateTo)")
    List<PurchaseOrder> search(
            @Param("supplierId") Long supplierId,
            @Param("status") PurchaseOrderStatus status,
            @Param("contactPerson") String contactPerson,
            @Param("dateFrom") LocalDateTime dateFrom,
            @Param("dateTo") LocalDateTime dateTo);

    }