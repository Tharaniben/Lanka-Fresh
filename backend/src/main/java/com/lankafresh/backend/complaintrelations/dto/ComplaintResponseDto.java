package com.lankafresh.backend.complaintrelations.dto;

import com.lankafresh.backend.complaintrelations.model.Complaint;
import com.lankafresh.backend.complaintrelations.model.ComplaintCategory;
import com.lankafresh.backend.complaintrelations.model.ComplaintStatus;

import java.time.Instant;

/**
 * What we return to the frontend. Never return the Complaint entity directly (4.5).
 *
 * customerName is filled in by the service layer via UserService, so the CRO's
 * complaint queue doesn't have to make a second call just to show who filed what.
 */
public class ComplaintResponseDto {

    private Long id;
    private Long userId;
    private String customerName;   // resolved via UserService, may be null if lookup fails
    private Long orderId;
    private String subject;
    private String description;
    private ComplaintCategory category;
    private ComplaintStatus status;
    private String resolutionNotes;
    private Instant createdAt;
    private Instant updatedAt;
    private Instant resolvedAt;

    public static ComplaintResponseDto from(Complaint complaint, String customerName) {
        ComplaintResponseDto dto = new ComplaintResponseDto();
        dto.id = complaint.getId();
        dto.userId = complaint.getUserId();
        dto.customerName = customerName;
        dto.orderId = complaint.getOrderId();
        dto.subject = complaint.getSubject();
        dto.description = complaint.getDescription();
        dto.category = complaint.getCategory();
        dto.status = complaint.getStatus();
        dto.resolutionNotes = complaint.getResolutionNotes();
        dto.createdAt = complaint.getCreatedAt();
        dto.updatedAt = complaint.getUpdatedAt();
        dto.resolvedAt = complaint.getResolvedAt();
        return dto;
    }

    // --- getters / setters ---

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

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public ComplaintCategory getCategory() {
        return category;
    }

    public void setCategory(ComplaintCategory category) {
        this.category = category;
    }

    public ComplaintStatus getStatus() {
        return status;
    }

    public void setStatus(ComplaintStatus status) {
        this.status = status;
    }

    public String getResolutionNotes() {
        return resolutionNotes;
    }

    public void setResolutionNotes(String resolutionNotes) {
        this.resolutionNotes = resolutionNotes;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Instant getResolvedAt() {
        return resolvedAt;
    }

    public void setResolvedAt(Instant resolvedAt) {
        this.resolvedAt = resolvedAt;
    }
}
