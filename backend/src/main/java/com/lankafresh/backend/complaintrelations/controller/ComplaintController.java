package com.lankafresh.backend.complaintrelations.controller;

import com.lankafresh.backend.complaintrelations.dto.ComplaintRequestDto;
import com.lankafresh.backend.complaintrelations.dto.ComplaintResponseDto;
import com.lankafresh.backend.complaintrelations.dto.ComplaintStatusUpdateDto;
import com.lankafresh.backend.complaintrelations.service.ComplaintService;
import com.lankafresh.backend.config.ApiResponse; // shared wrapper, built once by Tharaniben (4.10)
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/v1/complaints")
public class ComplaintController {

    private final ComplaintService complaintService;

    public ComplaintController(ComplaintService complaintService) {
        this.complaintService = complaintService;
    }

    /** Customer submits a new complaint. */
    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<ComplaintResponseDto>> submitComplaint(
            @Valid @RequestBody ComplaintRequestDto request) {
        try {
            ComplaintResponseDto dto = complaintService.submitComplaint(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(dto));
        } catch (ResponseStatusException ex) {
            return ResponseEntity.status(ex.getStatusCode()).body(ApiResponse.error(ex.getReason()));
        }
    }

    /** Customer views their own complaint history / tracking. */
    @GetMapping("/my")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<List<ComplaintResponseDto>>> getMyComplaints() {
        List<ComplaintResponseDto> complaints = complaintService.getMyComplaints();
        return ResponseEntity.ok(ApiResponse.success(complaints));
    }

    /** CRO / Branch Manager: full complaint queue, optionally filtered by status. */
    @GetMapping
    @PreAuthorize("hasAnyRole('CRO', 'BRANCH_MANAGER')")
    public ResponseEntity<ApiResponse<List<ComplaintResponseDto>>> getAllComplaints(
            @RequestParam(required = false) String status) {
        try {
            List<ComplaintResponseDto> complaints = complaintService.getAllComplaints(status);
            return ResponseEntity.ok(ApiResponse.success(complaints));
        } catch (ResponseStatusException ex) {
            return ResponseEntity.status(ex.getStatusCode()).body(ApiResponse.error(ex.getReason()));
        }
    }

    /** Single complaint - owner (customer) or CRO/Branch Manager only. */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ComplaintResponseDto>> getComplaintById(@PathVariable Long id) {
        try {
            ComplaintResponseDto dto = complaintService.getComplaintById(id);
            return ResponseEntity.ok(ApiResponse.success(dto));
        } catch (ResponseStatusException ex) {
            return ResponseEntity.status(ex.getStatusCode()).body(ApiResponse.error(ex.getReason()));
        }
    }

    /** CRO / Branch Manager: move a complaint through OPEN -> IN_PROGRESS -> RESOLVED/CLOSED. */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('CRO', 'BRANCH_MANAGER')")
    public ResponseEntity<ApiResponse<ComplaintResponseDto>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody ComplaintStatusUpdateDto request) {
        try {
            ComplaintResponseDto dto = complaintService.updateStatus(id, request);
            return ResponseEntity.ok(ApiResponse.success(dto));
        } catch (ResponseStatusException ex) {
            return ResponseEntity.status(ex.getStatusCode()).body(ApiResponse.error(ex.getReason()));
        }
    }
}
