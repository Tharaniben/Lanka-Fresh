package com.lankafresh.backend.cartorder.model;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;

/**
 * What the API sends back to the frontend for one row in the cart.
 * Bakes in the product name/image/price so the frontend doesn't need
 * a second request per item.
 */
@Getter
@AllArgsConstructor
public class CartItemResponseDto {
    private Long cartItemId;
    private Long productId;
    private String productName;
    private String productImageUrl;
    private BigDecimal unitPrice;
    private Integer quantity;
    private BigDecimal lineTotal;

    public static CartItemResponseDto from(CartItem item) {
        BigDecimal unitPrice = item.getProduct().getPrice();
        BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(item.getQuantity()));
        return new CartItemResponseDto(
                item.getId(),
                item.getProduct().getId(),
                item.getProduct().getName(),
                item.getProduct().getImageUrl(),
                unitPrice,
                item.getQuantity(),
                lineTotal
        );
    }
}
