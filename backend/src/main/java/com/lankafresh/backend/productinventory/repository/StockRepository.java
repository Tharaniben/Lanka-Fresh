package com.lankafresh.backend.productinventory.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.lankafresh.backend.productinventory.model.Stock;

import jakarta.persistence.LockModeType;

@Repository
public interface StockRepository extends JpaRepository<Stock, Long> {

    /**
     * Find stock by product ID.
     * Used by ProductService.decrementStock() when an order is placed,
     * and by ProductService.toDto() to include quantity in product responses.
     */
    Optional<Stock> findByProductId(Long productId);

    /**
     * Find stock by product ID and acquire a pessimistic write lock.
     * Prevents race conditions during concurrent checkouts.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM Stock s WHERE s.product.id = :productId")
    Optional<Stock> findByProductIdForUpdate(@Param("productId") Long productId);

    /**
     * Fetch stocks for multiple products in one query.
     * Prevents N+1 query problem.
     */
    List<Stock> findByProductIdIn(List<Long> productIds);

    /**
     * Find all stock records where quantity is at or below the threshold.
     * Used by the low-stock alert endpoint.
     *
     * @Query lets us write JPQL (Java Persistence Query Language) for cases
     * where Spring Data's method naming isn't expressive enough.
     * s.quantity <= s.lowStockThreshold compares two fields on the same row —
     * Spring Data can't generate this from a method name alone.
     */
    @Query("SELECT s FROM Stock s WHERE s.quantity <= s.lowStockThreshold")
    List<Stock> findLowStockItems();
}
