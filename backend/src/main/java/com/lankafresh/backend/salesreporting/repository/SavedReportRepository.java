package com.lankafresh.backend.salesreporting.repository;

import com.lankafresh.backend.salesreporting.model.ReportType;
import com.lankafresh.backend.salesreporting.model.SavedReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SavedReportRepository extends JpaRepository<SavedReport, Long> {
    List<SavedReport> findAllByOrderByCreatedAtDesc();
    List<SavedReport> findByReportTypeOrderByCreatedAtDesc(ReportType reportType);
}
