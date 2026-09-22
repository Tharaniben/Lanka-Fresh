package com.lankafresh.backend.cartorder.model;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** What the frontend sends when changing a cart item's quantity (the +/- buttons). */
@Getter
@NoArgsConstructor
public class UpdateCartItemRequestDto {

    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be greater than zero")
    private Integer quantity;
}
