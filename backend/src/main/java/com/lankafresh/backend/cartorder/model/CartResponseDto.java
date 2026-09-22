package com.lankafresh.backend.cartorder.model;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

/**
 * Full cart snapshot: every item plus the calculated subtotal,
 * delivery fee, and grand total. This is the single object the
 * frontend needs to render the whole cart page.
 */
@Getter
@AllArgsConstructor
public class CartResponseDto {
    private Long cartId;
    private List<CartItemResponseDto> items;
    private BigDecimal subtotal;
    private BigDecimal deliveryFee;
    private BigDecimal grandTotal;
}
