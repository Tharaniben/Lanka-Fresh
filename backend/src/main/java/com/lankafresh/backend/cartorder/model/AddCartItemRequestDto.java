package com.lankafresh.backend.cartorder.model;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** What the frontend sends when adding a product to the cart. */
@Getter
@NoArgsConstructor
public class AddCartItemRequestDto {

    @NotNull(message = "Product id is required")
    private Long productId;

    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be greater than zero")
    private Integer quantity;
}
