package com.lankafresh.backend.deliverymanagement.dto;

import java.time.LocalDateTime;

public class DeliveryAssignmentResponseDto {

    private Long id;
    private Long deliveryId;
    private Long agentUserId;
    private LocalDateTime assignedAt;
    private LocalDateTime cancelledAt;
    private boolean active;

    public DeliveryAssignmentResponseDto() {
    }

    public DeliveryAssignmentResponseDto(Long id, Long deliveryId, Long agentUserId,
                                          LocalDateTime assignedAt, LocalDateTime cancelledAt,
                                          boolean active) {
        this.id = id;
        this.deliveryId = deliveryId;
        this.agentUserId = agentUserId;
        this.assignedAt = assignedAt;
        this.cancelledAt = cancelledAt;
        this.active = active;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getDeliveryId() {
        return deliveryId;
    }

    public void setDeliveryId(Long deliveryId) {
        this.deliveryId = deliveryId;
    }

    public Long getAgentUserId() {
        return agentUserId;
    }

    public void setAgentUserId(Long agentUserId) {
        this.agentUserId = agentUserId;
    }

    public LocalDateTime getAssignedAt() {
        return assignedAt;
    }

    public void setAssignedAt(LocalDateTime assignedAt) {
        this.assignedAt = assignedAt;
    }

    public LocalDateTime getCancelledAt() {
        return cancelledAt;
    }

    public void setCancelledAt(LocalDateTime cancelledAt) {
        this.cancelledAt = cancelledAt;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}
