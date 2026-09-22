package com.lankafresh.backend.cartorder.model;

import com.lankafresh.backend.user.model.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * A placed order, created from a user's cart at checkout time.
 * Money fields are snapshotted here (and on each OrderItem) so that a
 * later price change on the product never changes a past order's total.
 */
@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();

    @Column(name = "delivery_address", nullable = false)
    private String deliveryAddress;

    @Column(name = "subtotal", nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal;

    @Column(name = "delivery_fee", nullable = false, precision = 10, scale = 2)
    private BigDecimal deliveryFee;

    @Column(name = "grand_total", nullable = false, precision = 10, scale = 2)
    private BigDecimal grandTotal;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private OrderStatus status = OrderStatus.PLACED;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public Order(User user, String deliveryAddress, BigDecimal subtotal,
                 BigDecimal deliveryFee, BigDecimal grandTotal) {
        this.user = user;
        this.deliveryAddress = deliveryAddress;
        this.subtotal = subtotal;
        this.deliveryFee = deliveryFee;
        this.grandTotal = grandTotal;
        this.status = OrderStatus.PLACED;
        this.createdAt = Instant.now();
    }

    public void addItem(OrderItem item) {
        items.add(item);
        item.setOrder(this);
    }
}
