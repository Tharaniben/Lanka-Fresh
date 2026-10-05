package com.lankafresh.backend.complaintrelations.repository;

import com.lankafresh.backend.complaintrelations.model.Complaint;
import com.lankafresh.backend.complaintrelations.model.ComplaintStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ComplaintRepository extends JpaRepository<Complaint, Long> {

    List<Complaint> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Complaint> findByStatusOrderByCreatedAtAsc(ComplaintStatus status);

    List<Complaint> findAllByOrderByCreatedAtDesc();

    long countByStatus(ComplaintStatus status);
}
