package com.lankafresh.backend.salesreporting.controller;

import com.lankafresh.backend.config.ApiResponse;
import com.lankafresh.backend.config.BaseController;
import com.lankafresh.backend.salesreporting.model.*;
import com.lankafresh.backend.salesreporting.service.ReportingService;
import com.lankafresh.backend.user.model.User;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * REST endpoints for Sales and Business Reporting module.
 * Base path: /api/v1/reports
 */
@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
public class ReportController extends BaseController {

    private final ReportingService reportingService;

    // ── Live Reporting Endpoints ────────────────────────────────────

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<ReportDtos.DashboardSummaryDto>> getDashboardSummary() {
        return ResponseEntity.ok(ApiResponse.success(reportingService.getDashboardSummary()));
    }

    @GetMapping("/sales")
    public ResponseEntity<ApiResponse<ReportDtos.SalesReportDto>> getSalesReport(
            @RequestParam(required = false, defaultValue = "daily") String range,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        return ResponseEntity.ok(ApiResponse.success(reportingService.getSalesReport(range, from, to)));
    }

    @GetMapping("/revenue")
    public ResponseEntity<ApiResponse<ReportDtos.RevenueReportDto>> getRevenueReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        return ResponseEntity.ok(ApiResponse.success(reportingService.getRevenueReport(from, to)));
    }

    @GetMapping("/best-sellers")
    public ResponseEntity<ApiResponse<List<ReportDtos.BestSellerDto>>> getBestSellers(
            @RequestParam(required = false, defaultValue = "10") int limit
    ) {
        return ResponseEntity.ok(ApiResponse.success(reportingService.getBestSellers(limit)));
    }

    @GetMapping("/inventory")
    public ResponseEntity<ApiResponse<ReportDtos.InventoryReportDto>> getInventoryReport() {
        return ResponseEntity.ok(ApiResponse.success(reportingService.getInventoryReport()));
    }

    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<ReportDtos.OrderReportDto>> getOrderReport() {
        return ResponseEntity.ok(ApiResponse.success(reportingService.getOrderReport()));
    }

    // ── Saved Reports CRUD ──────────────────────────────────────────

    @GetMapping("/saved")
    public ResponseEntity<ApiResponse<List<SavedReportResponseDto>>> getAllSavedReports() {
        return ResponseEntity.ok(ApiResponse.success(reportingService.getAllSavedReports()));
    }

    @GetMapping("/saved/{id}")
    @PreAuthorize("hasAnyRole('BRANCH_MANAGER', 'SALES_STAFF')")
    public ResponseEntity<ApiResponse<SavedReportResponseDto>> getSavedReportById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(reportingService.getSavedReportById(id)));
    }

    @PostMapping("/saved")
    @PreAuthorize("hasAnyRole('BRANCH_MANAGER', 'SALES_STAFF')")
    public ResponseEntity<ApiResponse<SavedReportResponseDto>> createSavedReport(
            @Valid @RequestBody SavedReportRequestDto request,
            HttpServletRequest servletRequest
    ) {
        User user = (User) servletRequest.getAttribute("currentUser");
        SavedReportResponseDto response = reportingService.saveReport(request, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }

    @PutMapping("/saved/{id}")
    @PreAuthorize("hasAnyRole('BRANCH_MANAGER', 'SALES_STAFF')")
    public ResponseEntity<ApiResponse<SavedReportResponseDto>> updateSavedReport(
            @PathVariable Long id,
            @Valid @RequestBody SavedReportRequestDto request
    ) {
        return ResponseEntity.ok(ApiResponse.success(reportingService.updateSavedReport(id, request)));
    }

    @DeleteMapping("/saved/{id}")
    @PreAuthorize("hasAnyRole('BRANCH_MANAGER', 'SALES_STAFF')")
    public ResponseEntity<ApiResponse<Void>> deleteSavedReport(@PathVariable Long id) {
        reportingService.deleteSavedReport(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
