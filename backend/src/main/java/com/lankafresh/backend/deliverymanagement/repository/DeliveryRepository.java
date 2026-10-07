package com.lankafresh.backend.deliverymanagement.repository;

import com.lankafresh.backend.deliverymanagement.model.Delivery;
import com.lankafresh.backend.deliverymanagement.model.DeliveryStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DeliveryRepository extends JpaRepository<Delivery, Long> {

    Optional<Delivery> findByOrderId(Long orderId);

    List<Delivery> findByStatus(DeliveryStatus status);

    // "Unassigned" deliveries for GET /api/v1/deliveries/unassigned
    List<Delivery> findByStatusOrderByCreatedAtAsc(DeliveryStatus status);

    @org.springframework.data.jpa.repository.Query(
        value = "SELECT d.* FROM deliveries d JOIN orders o ON d.order_id = o.id WHERE o.user_id = :userId ORDER BY d.created_at DESC",
        nativeQuery = true
    )
    List<Delivery> findDeliveriesByCustomerUserId(@org.springframework.data.repository.query.Param("userId") Long userId);
}
