package com.lankafresh.backend.cartorder.model;

import com.lankafresh.backend.user.model.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

/**
 * In-app notification for order status changes and order updates.
 * Owned by Shopping Cart & Order Management (Gunasekara A.D.S.J.)
 */
@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "order_id")
    private Long orderId;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "message", nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(name = "read_status", nullable = false)
    private boolean readStatus = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public Notification(User user, Long orderId, String title, String message) {
        this.user = user;
        this.orderId = orderId;
        this.title = title;
        this.message = message;
        this.readStatus = false;
        this.createdAt = Instant.now();
    }
}
