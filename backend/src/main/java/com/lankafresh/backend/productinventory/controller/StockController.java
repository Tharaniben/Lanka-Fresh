package com.lankafresh.backend.productinventory.controller;

import com.lankafresh.backend.config.ApiResponse;
import com.lankafresh.backend.config.BaseController;
import com.lankafresh.backend.productinventory.model.StockResponseDto;
import com.lankafresh.backend.productinventory.model.StockUpdateRequestDto;
import com.lankafresh.backend.productinventory.service.StockService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST endpoints for Stock management.
 * Base path: /api/v1/inventory/stock
 *
 * GET    /api/v1/inventory/stock                    — all stock (staff only)
 * GET    /api/v1/inventory/stock/product/{productId} — stock for one product
 * GET    /api/v1/inventory/stock/low-stock           — low stock alerts (staff only)
 * PUT    /api/v1/inventory/stock/product/{productId} — update stock (staff only)
 */
@RestController
@RequestMapping("/api/v1/inventory/stock")
@RequiredArgsConstructor
public class StockController extends BaseController {

    private final StockService stockService;

    @GetMapping
    @PreAuthorize("hasAnyRole('INVENTORY_STAFF', 'BRANCH_MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<StockResponseDto>>> getAllStock() {
        return ResponseEntity.ok(ApiResponse.success(stockService.getAllStock()));
    }

    /**
     * Public — customers can see stock for a specific product
     * (used to show "In Stock" / "Out of Stock" on the product page).
     */
    @GetMapping("/product/{productId}")
    public ResponseEntity<ApiResponse<StockResponseDto>> getStockByProductId(
            @PathVariable Long productId) {
        return ResponseEntity.ok(ApiResponse.success(
                stockService.getStockByProductId(productId)));
    }

    /**
     * Low stock alert — staff only.
     * Returns all products that need restocking.
     */
    @GetMapping("/low-stock")
    @PreAuthorize("hasAnyRole('INVENTORY_STAFF', 'BRANCH_MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<StockResponseDto>>> getLowStockItems() {
        return ResponseEntity.ok(ApiResponse.success(stockService.getLowStockItems()));
    }

    /**
     * Update stock quantity — used when new stock arrives from a supplier.
     * Staff only — customers cannot update stock.
     */
    @PutMapping("/product/{productId}")
    @PreAuthorize("hasAnyRole('INVENTORY_STAFF', 'BRANCH_MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<StockResponseDto>> updateStock(
            @PathVariable Long productId,
            @Valid @RequestBody StockUpdateRequestDto request) {
        return ResponseEntity.ok(ApiResponse.success(
                stockService.updateStock(productId, request)));
    }
}
