package com.lankafresh.backend.productinventory.controller;

import com.lankafresh.backend.config.ApiResponse;
import com.lankafresh.backend.config.BaseController;
import com.lankafresh.backend.productinventory.model.CategoryRequestDto;
import com.lankafresh.backend.productinventory.model.CategoryResponseDto;
import com.lankafresh.backend.productinventory.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST endpoints for Category management.
 * Base path: /api/v1/inventory/categories
 *
 * GET    /api/v1/inventory/categories        — list all categories (any logged-in user)
 * GET    /api/v1/inventory/categories/{id}   — get one category (any logged-in user)
 * POST   /api/v1/inventory/categories        — create a category (inventory staff only)
 * PUT    /api/v1/inventory/categories/{id}   — update a category (inventory staff only)
 * DELETE /api/v1/inventory/categories/{id}   — delete a category (inventory staff only)
 */
@RestController
@RequestMapping("/api/v1/inventory/categories")
@RequiredArgsConstructor
public class CategoryController extends BaseController {

    private final CategoryService categoryService;

    /**
     * Any logged-in user can view categories —
     * customers need this to browse products by category.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryResponseDto>>> getAllCategories() {
        return ResponseEntity.ok(ApiResponse.success(categoryService.getAllCategories()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryResponseDto>> getCategoryById(
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(categoryService.getCategoryById(id)));
    }

    /**
     * Only inventory staff and branch manager can create/edit/delete categories.
     * @PreAuthorize checks the role from the local User table (set by JwtUserFilter).
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('INVENTORY_STAFF', 'BRANCH_MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<CategoryResponseDto>> createCategory(
            @Valid @RequestBody CategoryRequestDto request) {
        CategoryResponseDto created = categoryService.createCategory(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('INVENTORY_STAFF', 'BRANCH_MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<CategoryResponseDto>> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody CategoryRequestDto request) {
        return ResponseEntity.ok(ApiResponse.success(
                categoryService.updateCategory(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('INVENTORY_STAFF', 'BRANCH_MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
