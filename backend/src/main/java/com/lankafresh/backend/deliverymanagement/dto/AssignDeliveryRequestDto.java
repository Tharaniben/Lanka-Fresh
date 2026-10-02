package com.lankafresh.backend.deliverymanagement.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class AssignDeliveryRequestDto {

    @NotNull(message = "agentUserId is required")
    @Positive(message = "agentUserId must be a positive number")
    private Long agentUserId;

    public AssignDeliveryRequestDto() {
    }

    public AssignDeliveryRequestDto(Long agentUserId) {
        this.agentUserId = agentUserId;
    }

    public Long getAgentUserId() {
        return agentUserId;
    }

    public void setAgentUserId(Long agentUserId) {
        this.agentUserId = agentUserId;
    }
}
