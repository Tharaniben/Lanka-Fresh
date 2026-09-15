package com.lankafresh.backend.productinventory.model;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Instant;

/**
 * What the API sends back to the frontend for a product.
 * Includes category details inline so the frontend doesn't need
 * a second request to get category name.
 * Also includes current stock quantity for the product listing page.
 */
@Getter
@AllArgsConstructor
public class ProductResponseDto {
    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private String imageUrl;
    private LocalDate expiryDate;
    private boolean active;
    private Long categoryId;
    private String categoryName;
    private Integer stockQuantity;  // null if stock not yet created
    private Instant createdAt;

    public static ProductResponseDto from(Product product, Integer stockQuantity) {
        return new ProductResponseDto(
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getPrice(),
                product.getImageUrl(),
                product.getExpiryDate(),
                product.isActive(),
                product.getCategory().getId(),
                product.getCategory().getName(),
                stockQuantity,
                product.getCreatedAt()
        );
    }
}
