package com.lankafresh.backend.deliverymanagement.dto;

import com.lankafresh.backend.deliverymanagement.model.DeliveryStatus;
import jakarta.validation.constraints.NotNull;

public class UpdateDeliveryStatusRequestDto {

    @NotNull(message = "status is required")
    private DeliveryStatus status;

    public UpdateDeliveryStatusRequestDto() {
    }

    public UpdateDeliveryStatusRequestDto(DeliveryStatus status) {
        this.status = status;
    }

    public DeliveryStatus getStatus() {
        return status;
    }

    public void setStatus(DeliveryStatus status) {
        this.status = status;
    }
}
