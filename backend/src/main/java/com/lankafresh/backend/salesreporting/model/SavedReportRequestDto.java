package com.lankafresh.backend.salesreporting.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SavedReportRequestDto {

    @NotBlank(message = "Report name is required")
    private String name;

    @NotNull(message = "Report type is required")
    private ReportType reportType;

    private LocalDate dateRangeStart;

    private LocalDate dateRangeEnd;

    private String parameters;

    private String summaryJson;
}
