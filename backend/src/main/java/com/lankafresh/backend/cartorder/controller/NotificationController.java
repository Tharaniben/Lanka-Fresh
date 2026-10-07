package com.lankafresh.backend.cartorder.controller;

import com.lankafresh.backend.cartorder.model.NotificationResponseDto;
import com.lankafresh.backend.cartorder.service.NotificationService;
import com.lankafresh.backend.config.ApiResponse;
import com.lankafresh.backend.config.BaseController;
import com.lankafresh.backend.user.model.User;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST endpoints for customer status-change notifications.
 * Base path: /api/v1/notifications
 */
@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController extends BaseController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationResponseDto>>> getMyNotifications(HttpServletRequest request) {
        User user = getCurrentUser(request);
        return ResponseEntity.ok(ApiResponse.success(notificationService.getUserNotifications(user.getId())));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<NotificationResponseDto>> markAsRead(
            HttpServletRequest request,
            @PathVariable Long id) {
        User user = getCurrentUser(request);
        return ResponseEntity.ok(ApiResponse.success(notificationService.markAsRead(user.getId(), id)));
    }

    @PatchMapping("/read-all")
    public ResponseEntity<ApiResponse<String>> markAllAsRead(HttpServletRequest request) {
        User user = getCurrentUser(request);
        notificationService.markAllAsRead(user.getId());
        return ResponseEntity.ok(ApiResponse.success("All notifications marked as read"));
    }
}
