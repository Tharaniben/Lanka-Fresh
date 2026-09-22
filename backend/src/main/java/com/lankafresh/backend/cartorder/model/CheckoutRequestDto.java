package com.lankafresh.backend.cartorder.model;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** What the frontend sends when the user hits "Place Order". */
@Getter
@NoArgsConstructor
public class CheckoutRequestDto {

    @NotBlank(message = "Delivery address is required")
    private String deliveryAddress;
}
