package com.lankafresh.backend.supplierpurchase.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.lankafresh.backend.config.ApiResponse;
import com.lankafresh.backend.supplierpurchase.model.PurchaseOrder;
import com.lankafresh.backend.supplierpurchase.model.PurchaseOrderStatus;
import com.lankafresh.backend.supplierpurchase.service.PurchaseOrderService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/purchase-orders")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class PurchaseOrderController {

    private final PurchaseOrderService purchaseOrderService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<PurchaseOrder>>> getAllPurchaseOrders(
            @RequestParam(required = false) Long supplierId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String contactPerson,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo) {
        PurchaseOrderStatus statusEnum = (status != null && !status.isBlank())
                ? PurchaseOrderStatus.valueOf(status.toUpperCase())
                : null;
        List<PurchaseOrder> orders = purchaseOrderService.searchPurchaseOrders(
                supplierId, statusEnum, contactPerson, dateFrom, dateTo);
        return ResponseEntity.ok(ApiResponse.success(orders));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PurchaseOrder>> getPurchaseOrderById(@PathVariable Long id) {
        PurchaseOrder order = purchaseOrderService.getPurchaseOrderById(id);
        return ResponseEntity.ok(ApiResponse.success(order));
    }

    @PostMapping
    
    public ResponseEntity<ApiResponse<PurchaseOrder>> createPurchaseOrder(
          @Valid   @RequestBody PurchaseOrder purchaseOrder) {
        PurchaseOrder created = purchaseOrderService.createPurchaseOrder(purchaseOrder);
        return ResponseEntity.ok(ApiResponse.success(created));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<PurchaseOrder>> updateStatus(
            @PathVariable Long id, @RequestBody Map<String, String> body) {
        PurchaseOrderStatus newStatus = PurchaseOrderStatus.valueOf(body.get("status").toUpperCase());
        PurchaseOrder updated = purchaseOrderService.updateStatus(id, newStatus);
        return ResponseEntity.ok(ApiResponse.success(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePurchaseOrder(@PathVariable Long id) {
        purchaseOrderService.deletePurchaseOrder(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}