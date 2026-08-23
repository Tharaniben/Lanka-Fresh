package com.lankafresh.backend.productinventory.repository;

import com.lankafresh.backend.productinventory.model.Stock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StockRepository extends JpaRepository<Stock, Long> {

    /**
     * Find stock by product ID.
     * Used by ProductService.decrementStock() when an order is placed,
     * and by ProductService.toDto() to include quantity in product responses.
     */
    Optional<Stock> findByProductId(Long productId);

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
