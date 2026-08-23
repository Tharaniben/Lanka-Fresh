package com.lankafresh.backend.productinventory.model;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * What the API sends back to the frontend when returning category data.
 * Never return the raw Category entity from a controller — always use this.
 */
@Getter
@AllArgsConstructor
public class CategoryResponseDto {
    private Long id;
    private String name;
    private String description;

    /**
     * Converts a Category entity into a CategoryResponseDto.
     * Call this in the service layer before returning data to the controller.
     */
    public static CategoryResponseDto from(Category category) {
        return new CategoryResponseDto(
                category.getId(),
                category.getName(),
                category.getDescription()
        );
    }
}
