package com.lankafresh.backend.productinventory.controller;

import com.lankafresh.backend.config.ApiResponse;
import com.lankafresh.backend.config.BaseController;
import com.lankafresh.backend.productinventory.model.ProductRequestDto;
import com.lankafresh.backend.productinventory.model.ProductResponseDto;
import com.lankafresh.backend.productinventory.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST endpoints for Product management.
 * Base path: /api/v1/inventory/products
 *
 * GET    /api/v1/inventory/products              — active products (customers)
 * GET    /api/v1/inventory/products/all          — all products incl inactive (staff)
 * GET    /api/v1/inventory/products/{id}         — single product
 * GET    /api/v1/inventory/products/category/{id} — products by category
 * POST   /api/v1/inventory/products              — create product (staff only)
 * PUT    /api/v1/inventory/products/{id}         — update product (staff only)
 * DELETE /api/v1/inventory/products/{id}         — deactivate product (staff only)
 */
@RestController
@RequestMapping("/api/v1/inventory/products")
@RequiredArgsConstructor
public class ProductController extends BaseController {

    private final ProductService productService;

    /** Customer-facing product listing — active products only */
    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductResponseDto>>> getAllActiveProducts() {
        return ResponseEntity.ok(ApiResponse.success(
                productService.getAllActiveProducts()));
    }

    /** Staff view — all products including inactive */
    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('INVENTORY_STAFF', 'BRANCH_MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<ProductResponseDto>>> getAllProducts() {
        return ResponseEntity.ok(ApiResponse.success(
                productService.getAllProducts()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponseDto>> getProductById(
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(
                productService.getProductById(id)));
    }

    /** Filter active products by category */
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<ApiResponse<List<ProductResponseDto>>> getProductsByCategory(
            @PathVariable Long categoryId) {
        return ResponseEntity.ok(ApiResponse.success(
                productService.getProductsByCategory(categoryId)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('INVENTORY_STAFF', 'BRANCH_MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<ProductResponseDto>> createProduct(
            @Valid @RequestBody ProductRequestDto request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(productService.createProduct(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('INVENTORY_STAFF', 'BRANCH_MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<ProductResponseDto>> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductRequestDto request) {
        return ResponseEntity.ok(ApiResponse.success(
                productService.updateProduct(id, request)));
    }

    /** Soft delete — sets active=false, preserves order history */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('INVENTORY_STAFF', 'BRANCH_MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deactivateProduct(
            @PathVariable Long id) {
        productService.deactivateProduct(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
