package com.lankafresh.backend.cartorder.model;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.Instant;

@Getter
@AllArgsConstructor
public class NotificationResponseDto {
    private Long id;
    private Long orderId;
    private String title;
    private String message;
    private boolean readStatus;
    private Instant createdAt;

    public static NotificationResponseDto from(Notification n) {
        return new NotificationResponseDto(
                n.getId(),
                n.getOrderId(),
                n.getTitle(),
                n.getMessage(),
                n.isReadStatus(),
                n.getCreatedAt()
        );
    }
}
