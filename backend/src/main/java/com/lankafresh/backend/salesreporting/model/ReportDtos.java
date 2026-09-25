package com.lankafresh.backend.salesreporting.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public class ReportDtos {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TimeSeriesPointDto {
        private String label;
        private BigDecimal value;
        private Long count;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryRevenueDto {
        private String category;
        private BigDecimal revenue;
        private Long unitsSold;
        private Double percentage;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DashboardSummaryDto {
        private BigDecimal todaySales;
        private BigDecimal weekRevenue;
        private Long totalOrders;
        private Long lowStockCount;
        private List<TimeSeriesPointDto> salesTrend;
        private List<BestSellerDto> topProducts;
        private Map<String, Long> orderStatus;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SalesReportDto {
        private String range;
        private LocalDate startDate;
        private LocalDate endDate;
        private BigDecimal totalSales;
        private Long totalOrders;
        private BigDecimal averageOrderValue;
        private List<TimeSeriesPointDto> timeline;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RevenueReportDto {
        private LocalDate startDate;
        private LocalDate endDate;
        private BigDecimal grossRevenue;
        private BigDecimal netRevenue;
        private BigDecimal cancelledAmount;
        private List<CategoryRevenueDto> categoryBreakdown;
        private List<TimeSeriesPointDto> dailyRevenue;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BestSellerDto {
        private Long productId;
        private String name;
        private String category;
        private Long quantitySold;
        private BigDecimal revenue;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InventoryReportDto {
        private Long totalProducts;
        private Long lowStockCount;
        private Long outOfStockCount;
        private Long nearExpiryCount;
        private List<InventoryItemDto> items;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InventoryItemDto {
        private Long productId;
        private String productName;
        private String category;
        private Integer currentStock;
        private Integer lowStockThreshold;
        private String status; // NORMAL, LOW_STOCK, OUT_OF_STOCK
        private LocalDate expiryDate;
        private Boolean nearExpiry;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderReportDto {
        private Long totalOrders;
        private Long completedOrders;
        private Long pendingOrders;
        private Long cancelledOrders;
        private Map<String, Long> statusCounts;
        private List<OrderSummaryDto> recentOrders;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderSummaryDto {
        private Long orderId;
        private String customerName;
        private BigDecimal totalAmount;
        private String status;
        private String createdAt;
    }
}
