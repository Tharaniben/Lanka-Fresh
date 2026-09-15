package com.lankafresh.backend.productinventory.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Instant;

/**
 * Represents a product in the LankaFresh catalogue.
 *
 * Relationships:
 * - ManyToOne with Category: many products belong to one category
 * - OneToOne with Stock: each product has exactly one stock record
 *   (Stock is created separately so stock updates don't touch product data)
 */
@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Product name is required")
    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    /**
     * Price stored as BigDecimal — never use float or double for money.
     * Float/double have rounding errors (e.g. 0.1 + 0.2 = 0.30000000000000004).
     * BigDecimal is exact. precision=10 means up to 10 digits total,
     * scale=2 means 2 decimal places (e.g. 9999999.99 LKR max).
     */
    @NotNull(message = "Price is required")
    @Positive(message = "Price must be greater than zero")
    @Column(name = "price", nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    /**
     * URL of the product image — stored as a string path.
     * Actual image upload/storage is handled separately (minor function).
     */
    @Column(name = "image_url")
    private String imageUrl;

    /**
     * Expiry date for perishable items (fruits, vegetables, dairy).
     * Null for non-perishable items.
     */
    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    /**
     * Whether the product is visible to customers.
     * Inventory staff can hide a product without deleting it.
     */
    @Column(name = "active", nullable = false)
    private boolean active = true;

    /**
     * ManyToOne: many products → one category.
     * LAZY loading means Hibernate won't fetch the Category from the DB
     * unless you explicitly access it — more efficient for list endpoints.
     * FetchType.LAZY is the default but we set it explicitly for clarity.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at")
    private Instant updatedAt = Instant.now();

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = Instant.now();
    }

    public Product(String name, String description, BigDecimal price,
                   String imageUrl, LocalDate expiryDate, Category category) {
        this.name = name;
        this.description = description;
        this.price = price;
        this.imageUrl = imageUrl;
        this.expiryDate = expiryDate;
        this.category = category;
        this.active = true;
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }
}
