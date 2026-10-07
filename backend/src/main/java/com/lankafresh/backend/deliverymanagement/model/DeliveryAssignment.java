package com.lankafresh.backend.deliverymanagement.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Records which delivery agent (a User with role DELIVERY_STAFF) is
 * assigned to which Delivery, and when. Full CRUD lives in this module
 * (PRD 5.4).
 *
 * agentUserId references the shared User entity by ID only — per PRD 4.6 /
 * 4.10, module tables reference User by ID rather than a JPA relation into
 * another module's package.
 *
 * Delivery is a same-module entity so a direct @ManyToOne is fine here.
 */
@Entity
@Table(name = "delivery_assignments")
public class DeliveryAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "delivery_id", nullable = false)
    private Delivery delivery;

    @Column(name = "agent_user_id", nullable = false)
    private Long agentUserId;

    @Column(name = "assigned_at", nullable = false)
    private LocalDateTime assignedAt;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    // True while this is the current/active assignment for the delivery.
    // Set false (rather than hard-deleted) when reassigned, so assignment
    // history is kept; hard-deleted only when the order is cancelled
    // before pickup, per PRD 5.4.
    @Column(name = "active", nullable = false)
    private boolean active = true;

    protected DeliveryAssignment() {
        // JPA
    }

    public DeliveryAssignment(Delivery delivery, Long agentUserId) {
        this.delivery = delivery;
        this.agentUserId = agentUserId;
        this.assignedAt = LocalDateTime.now();
        this.active = true;
    }

    public void cancel() {
        this.active = false;
        this.cancelledAt = LocalDateTime.now();
    }

    // --- Getters / setters ---

    public Long getId() {
        return id;
    }

    public Delivery getDelivery() {
        return delivery;
    }

    public void setDelivery(Delivery delivery) {
        this.delivery = delivery;
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

    public LocalDateTime getCancelledAt() {
        return cancelledAt;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}
