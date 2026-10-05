package com.lankafresh.backend.complaintrelations.service;

import com.lankafresh.backend.complaintrelations.dto.ComplaintRequestDto;
import com.lankafresh.backend.complaintrelations.dto.ComplaintResponseDto;
import com.lankafresh.backend.complaintrelations.dto.ComplaintStatusUpdateDto;

import java.util.List;

/**
 * Per 4.2 / 4.10: other modules should call THIS interface, never
 * ComplaintRepository or the Complaint entity directly.
 */
public interface ComplaintService {

    ComplaintResponseDto submitComplaint(ComplaintRequestDto request);

    ComplaintResponseDto getComplaintById(Long id);

    List<ComplaintResponseDto> getMyComplaints();

    List<ComplaintResponseDto> getAllComplaints(String statusFilter);

    ComplaintResponseDto updateStatus(Long id, ComplaintStatusUpdateDto request);

    /** Used by other modules (e.g. Reporting) that just need a count, not full rows. */
    long countOpenComplaints();
}
