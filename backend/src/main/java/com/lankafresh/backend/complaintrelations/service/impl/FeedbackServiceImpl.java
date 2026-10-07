package com.lankafresh.backend.complaintrelations.service.impl;

import com.lankafresh.backend.complaintrelations.dto.FeedbackRequestDto;
import com.lankafresh.backend.complaintrelations.dto.FeedbackResponseDto;
import com.lankafresh.backend.complaintrelations.model.Feedback;
import com.lankafresh.backend.complaintrelations.repository.FeedbackRepository;
import com.lankafresh.backend.complaintrelations.service.FeedbackService;
import com.lankafresh.backend.user.model.Role;
import com.lankafresh.backend.user.model.User;
import com.lankafresh.backend.user.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FeedbackServiceImpl implements FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final UserRepository userRepository;

    public FeedbackServiceImpl(FeedbackRepository feedbackRepository, UserRepository userRepository) {
        this.feedbackRepository = feedbackRepository;
        this.userRepository = userRepository;
    }

    private User getCurrentUser() {
        ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attrs != null) {
            HttpServletRequest request = attrs.getRequest();
            User user = (User) request.getAttribute("currentUser");
            if (user != null) {
                return user;
            }
        }
        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated");
    }

    private String formatName(User user) {
        if (user == null) {
            return null;
        }
        String first = user.getFirstName() != null ? user.getFirstName().trim() : "";
        String last = user.getLastName() != null ? user.getLastName().trim() : "";
        String fullName = (first + " " + last).trim();
        if (!fullName.isEmpty()) {
            return fullName;
        }
        return user.getEmail() != null ? user.getEmail() : "User #" + user.getId();
    }

    private String resolveName(Long userId) {
        if (userId == null) {
            return null;
        }
        return userRepository.findById(userId)
                .map(this::formatName)
                .orElse(null);
    }

    @Override
    @Transactional
    public FeedbackResponseDto submitFeedback(FeedbackRequestDto request) {
        User currentUser = getCurrentUser();

        Feedback feedback = new Feedback();
        feedback.setUserId(currentUser.getId());
        feedback.setOrderId(request.getOrderId());
        feedback.setRating(request.getRating());
        feedback.setComment(request.getComment());

        Feedback saved = feedbackRepository.save(feedback);
        return FeedbackResponseDto.from(saved, formatName(currentUser));
    }

    @Override
    @Transactional(readOnly = true)
    public List<FeedbackResponseDto> getMyFeedback() {
        User currentUser = getCurrentUser();
        return feedbackRepository.findByUserIdOrderByCreatedAtDesc(currentUser.getId())
                .stream()
                .map(f -> FeedbackResponseDto.from(f, formatName(currentUser)))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<FeedbackResponseDto> getAllFeedback() {
        User currentUser = getCurrentUser();
        if (currentUser.getRole() != Role.CRO && currentUser.getRole() != Role.BRANCH_MANAGER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only CRO or Branch Manager can view all feedback");
        }

        return feedbackRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(f -> FeedbackResponseDto.from(f, resolveName(f.getUserId())))
                .collect(Collectors.toList());
    }
}
