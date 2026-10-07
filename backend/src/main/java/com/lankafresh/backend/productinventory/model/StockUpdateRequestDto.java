package com.lankafresh.backend.productinventory.model;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;        // ← add this import
import lombok.Setter;

@Getter
@Setter                      // ← add this annotation
@NoArgsConstructor

public class StockUpdateRequestDto {

    @NotNull(message = "Quantity is required")
    @Min(value = 0, message = "Quantity cannot be negative")
    private Integer quantity;

    @Min(value = 0, message = "Threshold cannot be negative")
    private Integer lowStockThreshold;
}