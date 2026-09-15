package com.lankafresh.backend.productinventory.model;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * What the frontend sends in the request body when creating or updating a category.
 * @NotBlank triggers validation automatically — if name is missing,
 * GlobalExceptionHandler returns a 400 error before the service is even called.
 */
@Getter
@NoArgsConstructor
public class CategoryRequestDto {

    @NotBlank(message = "Category name is required")
    private String name;

    private String description;
}
