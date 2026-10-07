package com.lankafresh.backend.complaintrelations.service;

import com.lankafresh.backend.complaintrelations.dto.FeedbackRequestDto;
import com.lankafresh.backend.complaintrelations.dto.FeedbackResponseDto;

import java.util.List;

public interface FeedbackService {

    FeedbackResponseDto submitFeedback(FeedbackRequestDto request);

    List<FeedbackResponseDto> getMyFeedback();

    List<FeedbackResponseDto> getAllFeedback();
}
