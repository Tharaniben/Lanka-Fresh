package com.lankafresh.backend.salesreporting.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SavedReportResponseDto {

    private Long id;
    private String name;
    private ReportType reportType;
    private LocalDate dateRangeStart;
    private LocalDate dateRangeEnd;
    private String parameters;
    private String summaryJson;
    private Long createdByUserId;
    private String createdByName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static SavedReportResponseDto fromEntity(SavedReport report) {
        String author = "Branch Manager";
        if (report.getCreatedByName() != null && !report.getCreatedByName().isBlank()) {
            author = report.getCreatedByName();
        } else if (report.getCreatedBy() != null) {
            String fn = report.getCreatedBy().getFirstName();
            String ln = report.getCreatedBy().getLastName();
            String combined = ((fn != null ? fn : "") + " " + (ln != null ? ln : "")).trim();
            if (!combined.isEmpty()) {
                author = combined;
            }
        }

        return SavedReportResponseDto.builder()
                .id(report.getId())
                .name(report.getName())
                .reportType(report.getReportType())
                .dateRangeStart(report.getDateRangeStart())
                .dateRangeEnd(report.getDateRangeEnd())
                .parameters(report.getParameters())
                .summaryJson(report.getSummaryJson())
                .createdByUserId(report.getCreatedBy() != null ? report.getCreatedBy().getId() : null)
                .createdByName(author)
                .createdAt(report.getCreatedAt())
                .updatedAt(report.getUpdatedAt())
                .build();
    }
}
