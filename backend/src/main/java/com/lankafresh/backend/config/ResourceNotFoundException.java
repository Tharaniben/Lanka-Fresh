package com.lankafresh.backend.config;

/**
 * Throw this from any service method when a requested resource doesn't exist.
 * GlobalExceptionHandler will convert it to a 404 ApiResponse automatically.
 *
 * Example:
 *   throw new ResourceNotFoundException("Product not found with id: " + id);
 */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }
}
