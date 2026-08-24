package com.lankafresh.backend.config;

import lombok.Getter;

/**
 * Standard response envelope for every endpoint in the project.
 *
 * Every controller returns ResponseEntity<ApiResponse<YourDto>>.
 * Never return a raw entity or a plain String from a controller.
 *
 * Success:  { "success": true,  "data": { ... }, "message": null }
 * Error:    { "success": false, "data": null,    "message": "What went wrong" }
 *
 * Usage:
 *   return ResponseEntity.ok(ApiResponse.success(myDto));
 *   return ResponseEntity.status(404).body(ApiResponse.error("Product not found"));
 */
@Getter
public class ApiResponse<T> {

    private final boolean success;
    private final T data;
    private final String message;

    private ApiResponse(boolean success, T data, String message) {
        this.success = success;
        this.data = data;
        this.message = message;
    }

    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, data, null);
    }

    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>(false, null, message);
    }
}
