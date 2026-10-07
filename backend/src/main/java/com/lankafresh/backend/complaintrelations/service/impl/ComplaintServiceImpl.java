package com.lankafresh.backend.complaintrelations.service.impl;

import com.lankafresh.backend.complaintrelations.dto.ComplaintRequestDto;
import com.lankafresh.backend.complaintrelations.dto.ComplaintResponseDto;
import com.lankafresh.backend.complaintrelations.dto.ComplaintStatusUpdateDto;
import com.lankafresh.backend.complaintrelations.model.Complaint;
import com.lankafresh.backend.complaintrelations.model.ComplaintCategory;
import com.lankafresh.backend.complaintrelations.model.ComplaintStatus;
import com.lankafresh.backend.complaintrelations.repository.ComplaintRepository;
import com.lankafresh.backend.complaintrelations.service.ComplaintService;
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

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ComplaintServiceImpl implements ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;

    public ComplaintServiceImpl(ComplaintRepository complaintRepository, UserRepository userRepository) {
        this.complaintRepository = complaintRepository;
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

    @Override
    @Transactional
    public ComplaintResponseDto submitComplaint(ComplaintRequestDto request) {
        User currentUser = getCurrentUser();

        Complaint complaint = new Complaint();
        complaint.setUserId(currentUser.getId());
        complaint.setOrderId(request.getOrderId());
        complaint.setSubject(request.getSubject());
        complaint.setDescription(request.getDescription());
        complaint.setCategory(request.getCategory());
        complaint.setStatus(ComplaintStatus.OPEN);

        Complaint saved = complaintRepository.save(complaint);
        return ComplaintResponseDto.from(saved, formatName(currentUser));
    }

    @Override
    @Transactional(readOnly = true)
    public ComplaintResponseDto getComplaintById(Long id) {
        Complaint complaint = findOrThrow(id);
        User currentUser = getCurrentUser();

        boolean isOwner = complaint.getUserId().equals(currentUser.getId());
        String customerName = isOwner ? formatName(currentUser) : resolveName(complaint.getUserId());
        return ComplaintResponseDto.from(complaint, customerName);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ComplaintResponseDto> getMyComplaints() {
        User currentUser = getCurrentUser();
        return complaintRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(c -> {
                    boolean isOwner = c.getUserId().equals(currentUser.getId());
                    String name = isOwner ? formatName(currentUser) : resolveName(c.getUserId());
                    return ComplaintResponseDto.from(c, name);
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ComplaintResponseDto> getAllComplaints(String statusFilter) {
        User currentUser = getCurrentUser();
        if (!isCroOrManager(currentUser)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only CRO or Branch Manager can view all complaints");
        }

        List<Complaint> complaints;
        if (statusFilter != null && !statusFilter.isBlank()) {
            ComplaintStatus status = parseStatus(statusFilter);
            complaints = complaintRepository.findByStatusOrderByCreatedAtAsc(status);
        } else {
            complaints = complaintRepository.findAllByOrderByCreatedAtDesc();
        }

        return complaints.stream()
                .map(c -> ComplaintResponseDto.from(c, resolveName(c.getUserId())))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ComplaintResponseDto updateStatus(Long id, ComplaintStatusUpdateDto request) {
        User currentUser = getCurrentUser();
        if (!isCroOrManager(currentUser)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only CRO or Branch Manager can update complaint status");
        }

        Complaint complaint = findOrThrow(id);

        if ((request.getStatus() == ComplaintStatus.RESOLVED || request.getStatus() == ComplaintStatus.CLOSED)
                && (request.getResolutionNotes() == null || request.getResolutionNotes().isBlank())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Resolution notes are required when resolving or closing a complaint");
        }

        complaint.setStatus(request.getStatus());
        if (request.getResolutionNotes() != null && !request.getResolutionNotes().isBlank()) {
            complaint.setResolutionNotes(request.getResolutionNotes());
        }
        complaint.setHandledByUserId(currentUser.getId());
        if (request.getStatus() == ComplaintStatus.RESOLVED || request.getStatus() == ComplaintStatus.CLOSED) {
            complaint.setResolvedAt(Instant.now());
        }

        Complaint saved = complaintRepository.save(complaint);
        return ComplaintResponseDto.from(saved, resolveName(saved.getUserId()));
    }

    @Override
    @Transactional(readOnly = true)
    public long countOpenComplaints() {
        return complaintRepository.countByStatus(ComplaintStatus.OPEN);
    }

    // --- helpers ---

    private Complaint findOrThrow(Long id) {
        return complaintRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Complaint not found"));
    }

    private boolean isCroOrManager(User user) {
        return user.getRole() == Role.CRO
                || user.getRole() == Role.BRANCH_MANAGER;
    }

    private String resolveName(Long userId) {
        if (userId == null) {
            return null;
        }
        return userRepository.findById(userId)
                .map(this::formatName)
                .orElse(null);
    }

    private ComplaintStatus parseStatus(String raw) {
        try {
            return ComplaintStatus.valueOf(raw.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid status filter: " + raw);
        }
    }
}
