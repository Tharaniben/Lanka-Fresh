package com.lankafresh.backend.complaintrelations.controller;

import com.lankafresh.backend.complaintrelations.dto.FeedbackRequestDto;
import com.lankafresh.backend.complaintrelations.dto.FeedbackResponseDto;
import com.lankafresh.backend.complaintrelations.service.FeedbackService;
import com.lankafresh.backend.config.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/v1/feedback")
public class FeedbackController {

    private final FeedbackService feedbackService;

    public FeedbackController(FeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<FeedbackResponseDto>> submitFeedback(
            @Valid @RequestBody FeedbackRequestDto request) {
        FeedbackResponseDto dto = feedbackService.submitFeedback(request);
        return ResponseEntity.ok(ApiResponse.success(dto));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<List<FeedbackResponseDto>>> getMyFeedback() {
        return ResponseEntity.ok(ApiResponse.success(feedbackService.getMyFeedback()));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('CRO', 'BRANCH_MANAGER')")
    public ResponseEntity<ApiResponse<List<FeedbackResponseDto>>> getAllFeedback() {
        try {
            return ResponseEntity.ok(ApiResponse.success(feedbackService.getAllFeedback()));
        } catch (ResponseStatusException ex) {
            return ResponseEntity.status(ex.getStatusCode()).body(ApiResponse.error(ex.getReason()));
        }
    }
}
