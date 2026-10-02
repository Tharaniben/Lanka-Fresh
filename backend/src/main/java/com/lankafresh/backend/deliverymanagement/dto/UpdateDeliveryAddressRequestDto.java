package com.lankafresh.backend.deliverymanagement.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class UpdateDeliveryAddressRequestDto {

    @NotBlank(message = "deliveryAddress is required")
    @Size(max = 500, message = "deliveryAddress must be 500 characters or fewer")
    private String deliveryAddress;

    public UpdateDeliveryAddressRequestDto() {
    }

    public UpdateDeliveryAddressRequestDto(String deliveryAddress) {
        this.deliveryAddress = deliveryAddress;
    }

    public String getDeliveryAddress() {
        return deliveryAddress;
    }

    public void setDeliveryAddress(String deliveryAddress) {
        this.deliveryAddress = deliveryAddress;
    }
}
