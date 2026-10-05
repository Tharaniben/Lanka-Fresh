package com.lankafresh.backend.complaintrelations.dto;

import com.lankafresh.backend.complaintrelations.model.ComplaintStatus;
import jakarta.validation.constraints.NotNull;

/**
 * Sent by the CRO on PATCH /api/v1/complaints/{id}/status.
 * resolutionNotes is optional on IN_PROGRESS, expected on RESOLVED/CLOSED
 * (the service layer enforces that, not bean validation, since it's conditional).
 */
public class ComplaintStatusUpdateDto {

    @NotNull(message = "Status is required")
    private ComplaintStatus status;

    private String resolutionNotes;

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
}
