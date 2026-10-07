package com.lankafresh.backend.complaintrelations.dto;

import com.lankafresh.backend.complaintrelations.model.Feedback;

import java.time.Instant;

public class FeedbackResponseDto {

    private Long id;
    private Long userId;
    private String customerName;
    private Long orderId;
    private Integer rating;
    private String comment;
    private Instant createdAt;

    public static FeedbackResponseDto from(Feedback feedback, String customerName) {
        FeedbackResponseDto dto = new FeedbackResponseDto();
        dto.id = feedback.getId();
        dto.userId = feedback.getUserId();
        dto.customerName = customerName;
        dto.orderId = feedback.getOrderId();
        dto.rating = feedback.getRating();
        dto.comment = feedback.getComment();
        dto.createdAt = feedback.getCreatedAt();
        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
