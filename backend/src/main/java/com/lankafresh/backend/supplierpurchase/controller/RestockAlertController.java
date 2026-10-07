package com.lankafresh.backend.supplierpurchase.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.lankafresh.backend.config.ApiResponse;
import com.lankafresh.backend.supplierpurchase.model.NearExpiryProductDto;
import com.lankafresh.backend.supplierpurchase.service.RestockAlertService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/purchase-orders/alerts")
public class RestockAlertController {

    private final RestockAlertService restockAlertService;

    public RestockAlertController(RestockAlertService restockAlertService) {
        this.restockAlertService = restockAlertService;
    }

    @GetMapping("/near-expiry")
    @PreAuthorize("hasAnyRole('INVENTORY_STAFF', 'BRANCH_MANAGER')")
    public ResponseEntity<ApiResponse<List<NearExpiryProductDto>>> getNearExpiryProducts(
            @RequestParam(defaultValue = "14") int days) {
        return ResponseEntity.ok(ApiResponse.success(restockAlertService.getNearExpiryProducts(days)));
    }
}