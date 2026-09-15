package com.lankafresh.backend.productinventory.service;

import com.lankafresh.backend.config.ResourceNotFoundException;
import com.lankafresh.backend.productinventory.model.Category;
import com.lankafresh.backend.productinventory.model.CategoryRequestDto;
import com.lankafresh.backend.productinventory.model.CategoryResponseDto;
import com.lankafresh.backend.productinventory.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Business logic for Category.
 * The controller calls this — never the repository directly.
 */
@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    /**
     * Returns all categories.
     * Used to populate dropdowns when adding/editing a product.
     */
    @Transactional(readOnly = true)
    public List<CategoryResponseDto> getAllCategories() {
        return categoryRepository.findAll()
                .stream()
                .map(CategoryResponseDto::from)
                .toList();
    }

    /**
     * Returns one category by its ID.
     * Throws ResourceNotFoundException if not found —
     * GlobalExceptionHandler converts this to a 404 response automatically.
     */
    @Transactional(readOnly = true)
    public CategoryResponseDto getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Category not found with id: " + id));
        return CategoryResponseDto.from(category);
    }

    /**
     * Creates a new category.
     * Business rule: name must be unique — reject duplicates before saving.
     */
    @Transactional
    public CategoryResponseDto createCategory(CategoryRequestDto request) {
        if (categoryRepository.findByName(request.getName()).isPresent()) {
            throw new IllegalArgumentException(
                    "A category with name '" + request.getName() + "' already exists");
        }
        Category category = new Category(request.getName(), request.getDescription());
        return CategoryResponseDto.from(categoryRepository.save(category));
    }

    /**
     * Updates an existing category.
     * Business rule: new name must not clash with another category's name.
     */
    @Transactional
    public CategoryResponseDto updateCategory(Long id, CategoryRequestDto request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Category not found with id: " + id));

        if (categoryRepository.existsByNameAndIdNot(request.getName(), id)) {
            throw new IllegalArgumentException(
                    "A category with name '" + request.getName() + "' already exists");
        }

        category.setName(request.getName());
        category.setDescription(request.getDescription());
        return CategoryResponseDto.from(categoryRepository.save(category));
    }

    /**
     * Deletes a category by ID.
     * Note: if products exist under this category, MySQL will throw a
     * foreign key constraint error — handle this in a future iteration
     * by either blocking deletion or reassigning products first.
     */
    @Transactional
    public void deleteCategory(Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new ResourceNotFoundException("Category not found with id: " + id);
        }
        categoryRepository.deleteById(id);
    }
}
