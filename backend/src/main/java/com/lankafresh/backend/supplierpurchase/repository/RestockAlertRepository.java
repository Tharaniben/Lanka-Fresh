
package com.lankafresh.backend.supplierpurchase.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.lankafresh.backend.productinventory.model.Product;

// Read-only queries against Product & Inventory's own Product table.
// We never write through this repository - only StockService (owned by
// that module) is allowed to change stock/product data. This exists purely
// so Supplier & Purchase Order can surface near-expiry alerts to suggest
// restocking, per the PRD's module dependency note.
@Repository
public interface RestockAlertRepository extends JpaRepository<Product, Long> {

    @Query("SELECT p FROM Product p WHERE p.active = true " +
           "AND p.expiryDate IS NOT NULL " +
           "AND p.expiryDate BETWEEN :today AND :cutoff")
    List<Product> findNearExpiry(@Param("today") LocalDate today, @Param("cutoff") LocalDate cutoff);
}


