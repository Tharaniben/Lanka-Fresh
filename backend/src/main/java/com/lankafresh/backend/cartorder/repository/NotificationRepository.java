package com.lankafresh.backend.cartorder.repository;

import com.lankafresh.backend.cartorder.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);
    long countByUserIdAndReadStatusFalse(Long userId);
}
