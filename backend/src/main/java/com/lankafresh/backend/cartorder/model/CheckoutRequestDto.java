package com.lankafresh.backend.cartorder.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class CheckoutRequestDto {

    @NotBlank(message = "Delivery address is required")
    private String deliveryAddress;

    @NotBlank(message = "Card number is required")
    @Size(min = 12, max = 19, message = "Card number must be 12-19 digits")
    private String cardNumber;

    @NotBlank(message = "Cardholder name is required")
    private String cardHolderName;

    @NotBlank(message = "Expiry date is required")
    private String expiryDate;

    @NotBlank(message = "CVV is required")
    @Size(min = 3, max = 4, message = "CVV must be 3-4 digits")
    private String cvv;
}