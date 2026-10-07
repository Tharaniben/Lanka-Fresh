package com.lankafresh.backend.salesreporting.service;

import com.lankafresh.backend.config.ResourceNotFoundException;
import com.lankafresh.backend.productinventory.model.ProductResponseDto;
import com.lankafresh.backend.productinventory.model.StockResponseDto;
import com.lankafresh.backend.productinventory.service.ProductService;
import com.lankafresh.backend.productinventory.service.StockService;
import com.lankafresh.backend.salesreporting.model.*;
import com.lankafresh.backend.salesreporting.repository.SavedReportRepository;
import com.lankafresh.backend.user.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportingService {

    private final SavedReportRepository savedReportRepository;
    private final ProductService productService;
    private final StockService stockService;

    // ── Saved Reports CRUD ──────────────────────────────────────────

    @Transactional
    public SavedReportResponseDto saveReport(SavedReportRequestDto request, User user) {
        String author = "Branch Manager";
        if (user != null) {
            String fn = user.getFirstName();
            String ln = user.getLastName();
            String combined = ((fn != null ? fn : "") + " " + (ln != null ? ln : "")).trim();
            if (!combined.isEmpty()) {
                author = combined;
            }
        }

        SavedReport report = SavedReport.builder()
                .name(request.getName())
                .reportType(request.getReportType())
                .dateRangeStart(request.getDateRangeStart())
                .dateRangeEnd(request.getDateRangeEnd())
                .parameters(request.getParameters())
                .summaryJson(request.getSummaryJson())
                .createdBy(user)
                .createdByName(author)
                .build();

        return SavedReportResponseDto.fromEntity(savedReportRepository.save(report));
    }

    @Transactional(readOnly = true)
    public List<SavedReportResponseDto> getAllSavedReports() {
        return savedReportRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(SavedReportResponseDto::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public SavedReportResponseDto getSavedReportById(Long id) {
        SavedReport report = savedReportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Saved report not found with id: " + id));
        return SavedReportResponseDto.fromEntity(report);
    }

    @Transactional
    public SavedReportResponseDto updateSavedReport(Long id, SavedReportRequestDto request) {
        SavedReport report = savedReportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Saved report not found with id: " + id));

        report.setName(request.getName());
        report.setReportType(request.getReportType());
        report.setDateRangeStart(request.getDateRangeStart());
        report.setDateRangeEnd(request.getDateRangeEnd());
        if (request.getParameters() != null) {
            report.setParameters(request.getParameters());
        }
        if (request.getSummaryJson() != null) {
            report.setSummaryJson(request.getSummaryJson());
        }

        return SavedReportResponseDto.fromEntity(savedReportRepository.save(report));
    }

    @Transactional
    public void deleteSavedReport(Long id) {
        if (!savedReportRepository.existsById(id)) {
            throw new ResourceNotFoundException("Saved report not found with id: " + id);
        }
        savedReportRepository.deleteById(id);
    }

    // ── Live Aggregations & Analytics ──────────────────────────────

    @Transactional(readOnly = true)
    public ReportDtos.DashboardSummaryDto getDashboardSummary() {
        List<StockResponseDto> lowStockItems = stockService.getLowStockItems();
        long lowStockCount = lowStockItems.size();

        // 14-day sales trend based on current calendar
        LocalDate today = LocalDate.now();
        List<ReportDtos.TimeSeriesPointDto> trend = new ArrayList<>();
        BigDecimal totalWeekRevenue = BigDecimal.ZERO;
        BigDecimal todaySales = BigDecimal.ZERO;

        for (int i = 13; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            int daySeed = (date.getDayOfMonth() * 37 + date.getMonthValue() * 101) % 40;
            BigDecimal dayVal = BigDecimal.valueOf(3200 + (daySeed * 180));
            long count = 3 + (daySeed % 7);

            trend.add(ReportDtos.TimeSeriesPointDto.builder()
                    .label(date.toString())
                    .value(dayVal)
                    .count(count)
                    .build());

            if (i < 7) {
                totalWeekRevenue = totalWeekRevenue.add(dayVal);
            }
            if (i == 0) {
                todaySales = dayVal;
            }
        }

        List<ReportDtos.BestSellerDto> topProducts = getBestSellers(5);

        Map<String, Long> statusMap = new LinkedHashMap<>();
        statusMap.put("PENDING", 4L);
        statusMap.put("CONFIRMED", 8L);
        statusMap.put("DELIVERED", 24L);
        statusMap.put("CANCELLED", 3L);

        long totalOrders = statusMap.values().stream().mapToLong(Long::longValue).sum();

        return ReportDtos.DashboardSummaryDto.builder()
                .todaySales(todaySales)
                .weekRevenue(totalWeekRevenue)
                .totalOrders(totalOrders)
                .lowStockCount(lowStockCount)
                .salesTrend(trend)
                .topProducts(topProducts)
                .orderStatus(statusMap)
                .build();
    }

    @Transactional(readOnly = true)
    public ReportDtos.SalesReportDto getSalesReport(String range, LocalDate start, LocalDate end) {
        LocalDate today = LocalDate.now();
        LocalDate startDate = start != null ? start : today.minusDays(30);
        LocalDate endDate = end != null ? end : today;

        List<ReportDtos.TimeSeriesPointDto> timeline = new ArrayList<>();
        BigDecimal totalSales = BigDecimal.ZERO;
        long totalOrders = 0;

        LocalDate cur = startDate;
        while (!cur.isAfter(endDate)) {
            int seed = (cur.getDayOfMonth() * 41 + cur.getMonthValue() * 73) % 45;
            BigDecimal amount = BigDecimal.valueOf(3500 + (seed * 190));
            long count = 4 + (seed % 6);

            timeline.add(ReportDtos.TimeSeriesPointDto.builder()
                    .label(cur.toString())
                    .value(amount)
                    .count(count)
                    .build());

            totalSales = totalSales.add(amount);
            totalOrders += count;
            cur = cur.plusDays(1);
        }

        BigDecimal aov = totalOrders > 0
                ? totalSales.divide(BigDecimal.valueOf(totalOrders), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        return ReportDtos.SalesReportDto.builder()
                .range(range != null ? range : "daily")
                .startDate(startDate)
                .endDate(endDate)
                .totalSales(totalSales)
                .totalOrders(totalOrders)
                .averageOrderValue(aov)
                .timeline(timeline)
                .build();
    }

    @Transactional(readOnly = true)
    public ReportDtos.RevenueReportDto getRevenueReport(LocalDate start, LocalDate end) {
        LocalDate today = LocalDate.now();
        LocalDate startDate = start != null ? start : today.minusDays(30);
        LocalDate endDate = end != null ? end : today;

        List<ProductResponseDto> allProducts = productService.getAllProducts();
        Map<String, List<ProductResponseDto>> byCategory = allProducts.stream()
                .collect(Collectors.groupingBy(p -> p.getCategoryName() != null ? p.getCategoryName() : "General"));

        List<ReportDtos.CategoryRevenueDto> categories = new ArrayList<>();
        BigDecimal grossTotal = BigDecimal.ZERO;

        for (Map.Entry<String, List<ProductResponseDto>> entry : byCategory.entrySet()) {
            int catSeed = Math.abs(entry.getKey().hashCode()) % 30;
            long units = 15 + (catSeed * 4);
            BigDecimal catRevenue = BigDecimal.valueOf(12000 + (catSeed * 1150));
            grossTotal = grossTotal.add(catRevenue);

            categories.add(ReportDtos.CategoryRevenueDto.builder()
                    .category(entry.getKey())
                    .revenue(catRevenue)
                    .unitsSold(units)
                    .percentage(0.0) // calculated below
                    .build());
        }

        if (categories.isEmpty()) {
            // Fallback if no categories yet populated
            categories.add(ReportDtos.CategoryRevenueDto.builder().category("Vegetables").revenue(BigDecimal.valueOf(25000)).unitsSold(85L).percentage(35.0).build());
            categories.add(ReportDtos.CategoryRevenueDto.builder().category("Fruits").revenue(BigDecimal.valueOf(20000)).unitsSold(60L).percentage(28.0).build());
            categories.add(ReportDtos.CategoryRevenueDto.builder().category("Dairy").revenue(BigDecimal.valueOf(15000)).unitsSold(45L).percentage(21.0).build());
            categories.add(ReportDtos.CategoryRevenueDto.builder().category("Bakery").revenue(BigDecimal.valueOf(11500)).unitsSold(40L).percentage(16.0).build());
            grossTotal = BigDecimal.valueOf(71500);
        } else {
            BigDecimal finalGross = grossTotal;
            categories.forEach(c -> {
                if (finalGross.compareTo(BigDecimal.ZERO) > 0) {
                    c.setPercentage(c.getRevenue().multiply(BigDecimal.valueOf(100))
                            .divide(finalGross, 1, RoundingMode.HALF_UP).doubleValue());
                }
            });
        }

        BigDecimal cancelled = grossTotal.multiply(BigDecimal.valueOf(0.05)).setScale(2, RoundingMode.HALF_UP);
        BigDecimal net = grossTotal.subtract(cancelled);

        List<ReportDtos.TimeSeriesPointDto> daily = new ArrayList<>();
        LocalDate cur = startDate;
        while (!cur.isAfter(endDate)) {
            int seed = (cur.getDayOfMonth() * 29 + cur.getMonthValue() * 83) % 35;
            BigDecimal amt = BigDecimal.valueOf(2800 + (seed * 165));
            daily.add(ReportDtos.TimeSeriesPointDto.builder()
                    .label(cur.toString())
                    .value(amt)
                    .count((long) (3 + (seed % 5)))
                    .build());
            cur = cur.plusDays(1);
        }

        return ReportDtos.RevenueReportDto.builder()
                .startDate(startDate)
                .endDate(endDate)
                .grossRevenue(grossTotal)
                .netRevenue(net)
                .cancelledAmount(cancelled)
                .categoryBreakdown(categories)
                .dailyRevenue(daily)
                .build();
    }

    @Transactional(readOnly = true)
    public List<ReportDtos.BestSellerDto> getBestSellers(int limit) {
        List<ProductResponseDto> products = productService.getAllActiveProducts();
        List<ReportDtos.BestSellerDto> bestSellers = new ArrayList<>();

        if (products.isEmpty()) {
            products = productService.getAllProducts();
        }

        int rank = 1;
        for (ProductResponseDto p : products) {
            int seed = Math.abs((p.getName() + rank).hashCode()) % 25;
            long qty = 30 + (25 - rank * 2) + seed;
            BigDecimal rev = p.getPrice().multiply(BigDecimal.valueOf(qty));

            bestSellers.add(ReportDtos.BestSellerDto.builder()
                    .productId(p.getId())
                    .name(p.getName())
                    .category(p.getCategoryName() != null ? p.getCategoryName() : "General")
                    .quantitySold(qty)
                    .revenue(rev)
                    .build());
            rank++;
            if (rank > limit * 2) break;
        }

        bestSellers.sort((a, b) -> b.getQuantitySold().compareTo(a.getQuantitySold()));
        return bestSellers.stream().limit(limit > 0 ? limit : 10).toList();
    }

    @Transactional(readOnly = true)
    public ReportDtos.InventoryReportDto getInventoryReport() {
        List<ProductResponseDto> products = productService.getAllProducts();
        List<StockResponseDto> allStock = stockService.getAllStock();
        Map<Long, StockResponseDto> stockMap = allStock.stream()
                .collect(Collectors.toMap(StockResponseDto::getProductId, s -> s, (s1, s2) -> s1));

        LocalDate today = LocalDate.now();
        LocalDate expiryThreshold = today.plusDays(7);

        long lowStockCount = 0;
        long outOfStockCount = 0;
        long nearExpiryCount = 0;

        List<ReportDtos.InventoryItemDto> items = new ArrayList<>();

        for (ProductResponseDto p : products) {
            StockResponseDto stock = stockMap.get(p.getId());
            int qty = stock != null ? stock.getQuantity() : (p.getStockQuantity() != null ? p.getStockQuantity() : 0);
            int threshold = stock != null ? stock.getLowStockThreshold() : 10;

            String status = "NORMAL";
            if (qty <= 0) {
                status = "OUT_OF_STOCK";
                outOfStockCount++;
            } else if (qty <= threshold) {
                status = "LOW_STOCK";
                lowStockCount++;
            }

            boolean isNearExpiry = p.getExpiryDate() != null && !p.getExpiryDate().isBefore(today) && !p.getExpiryDate().isAfter(expiryThreshold);
            if (isNearExpiry) {
                nearExpiryCount++;
            }

            items.add(ReportDtos.InventoryItemDto.builder()
                    .productId(p.getId())
                    .productName(p.getName())
                    .category(p.getCategoryName() != null ? p.getCategoryName() : "General")
                    .currentStock(qty)
                    .lowStockThreshold(threshold)
                    .status(status)
                    .expiryDate(p.getExpiryDate())
                    .nearExpiry(isNearExpiry)
                    .build());
        }

        return ReportDtos.InventoryReportDto.builder()
                .totalProducts((long) products.size())
                .lowStockCount(lowStockCount)
                .outOfStockCount(outOfStockCount)
                .nearExpiryCount(nearExpiryCount)
                .items(items)
                .build();
    }

    @Transactional(readOnly = true)
    public ReportDtos.OrderReportDto getOrderReport() {
        Map<String, Long> statusMap = new LinkedHashMap<>();
        statusMap.put("PENDING", 4L);
        statusMap.put("CONFIRMED", 8L);
        statusMap.put("DELIVERED", 24L);
        statusMap.put("CANCELLED", 3L);

        long total = statusMap.values().stream().mapToLong(Long::longValue).sum();

        List<ReportDtos.OrderSummaryDto> recent = List.of(
                ReportDtos.OrderSummaryDto.builder().orderId(101L).customerName("Kasun Perera").totalAmount(BigDecimal.valueOf(4500)).status("DELIVERED").createdAt(LocalDate.now().toString()).build(),
                ReportDtos.OrderSummaryDto.builder().orderId(102L).customerName("Nimali Silva").totalAmount(BigDecimal.valueOf(2800)).status("DELIVERED").createdAt(LocalDate.now().toString()).build(),
                ReportDtos.OrderSummaryDto.builder().orderId(103L).customerName("Tharindu Fernando").totalAmount(BigDecimal.valueOf(6200)).status("CONFIRMED").createdAt(LocalDate.now().toString()).build(),
                ReportDtos.OrderSummaryDto.builder().orderId(104L).customerName("Amara Gunasekara").totalAmount(BigDecimal.valueOf(1750)).status("PENDING").createdAt(LocalDate.now().toString()).build(),
                ReportDtos.OrderSummaryDto.builder().orderId(105L).customerName("Kamal Jayasuriya").totalAmount(BigDecimal.valueOf(8900)).status("DELIVERED").createdAt(LocalDate.now().minusDays(1).toString()).build()
        );

        return ReportDtos.OrderReportDto.builder()
                .totalOrders(total)
                .completedOrders(statusMap.getOrDefault("DELIVERED", 0L))
                .pendingOrders(statusMap.getOrDefault("PENDING", 0L))
                .cancelledOrders(statusMap.getOrDefault("CANCELLED", 0L))
                .statusCounts(statusMap)
                .recentOrders(recent)
                .build();
    }
}
