package com.lankafresh.backend.cartorder.service;

import com.lankafresh.backend.cartorder.model.Notification;
import com.lankafresh.backend.cartorder.model.NotificationResponseDto;
import com.lankafresh.backend.cartorder.repository.NotificationRepository;
import com.lankafresh.backend.config.ResourceNotFoundException;
import com.lankafresh.backend.user.model.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @Transactional
    public void createNotification(User user, Long orderId, String title, String message) {
        Notification notification = new Notification(user, orderId, title, message);
        notificationRepository.save(notification);
    }

    @Transactional(readOnly = true)
    public List<NotificationResponseDto> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(NotificationResponseDto::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public NotificationResponseDto markAsRead(Long userId, Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + notificationId));

        if (!notification.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Notification not found with id: " + notificationId);
        }

        notification.setReadStatus(true);
        return NotificationResponseDto.from(notificationRepository.save(notification));
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        for (Notification n : notifications) {
            if (!n.isReadStatus()) {
                n.setReadStatus(true);
            }
        }
        notificationRepository.saveAll(notifications);
    }
}
