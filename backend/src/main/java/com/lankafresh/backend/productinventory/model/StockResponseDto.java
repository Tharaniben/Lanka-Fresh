package com.lankafresh.backend.productinventory.model;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.Instant;

/**
 * What the API sends back for a stock record.
 * Includes product name so the frontend doesn't need a second request.
 */
@Getter
@AllArgsConstructor
public class StockResponseDto {
    private Long id;
    private Long productId;
    private String productName;
    private int quantity;
    private int lowStockThreshold;
    private boolean lowStock;
    private Instant updatedAt;

    public static StockResponseDto from(Stock stock) {
        return new StockResponseDto(
                stock.getId(),
                stock.getProduct().getId(),
                stock.getProduct().getName(),
                stock.getQuantity(),
                stock.getLowStockThreshold(),
                stock.isLowStock(),
                stock.getUpdatedAt()
        );
    }
}
