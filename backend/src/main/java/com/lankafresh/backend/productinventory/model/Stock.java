package com.lankafresh.backend.productinventory.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

/**
 * Tracks the stock quantity for one product.
 *
 * Kept separate from Product deliberately:
 * - Stock changes on every order (decremented by Cart & Order module)
 * - Product details change only when staff edits them
 * - Separating them means order processing never touches the product table
 *
 * OneToOne with Product: one product has exactly one stock record.
 * Created automatically when a product is created (see ProductService.createProduct).
 */
@Entity
@Table(name = "stock")
@Getter
@Setter
@NoArgsConstructor
public class Stock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * OneToOne: one stock record → one product.
     * @JoinColumn creates a foreign key column "product_id" in the stock table.
     */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false, unique = true)
    private Product product;

    /**
     * Current quantity in stock.
     * @Min(0) — quantity can never go below zero.
     */
    @Min(value = 0, message = "Quantity cannot be negative")
    @Column(name = "quantity", nullable = false)
    private int quantity;

    /**
     * When quantity drops below this number, the product is flagged
     * as low stock. Default is 10 — inventory staff can adjust per product.
     */
    @Column(name = "low_stock_threshold", nullable = false)
    private int lowStockThreshold;

    @Column(name = "updated_at")
    private Instant updatedAt = Instant.now();

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = Instant.now();
    }

    public Stock(Product product, int quantity, int lowStockThreshold) {
        this.product = product;
        this.quantity = quantity;
        this.lowStockThreshold = lowStockThreshold;
        this.updatedAt = Instant.now();
    }

    /**
     * Convenience method — is this product running low?
     * Used by the low-stock alert endpoint.
     */
    public boolean isLowStock() {
        return this.quantity <= this.lowStockThreshold;
    }
}
