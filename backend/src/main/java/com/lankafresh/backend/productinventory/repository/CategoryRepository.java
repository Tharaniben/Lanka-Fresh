package com.lankafresh.backend.productinventory.repository;

import com.lankafresh.backend.productinventory.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Handles all database operations for Category.
 * Spring Data JPA auto-generates the SQL from method names —
 * you don't write any queries manually here.
 */
@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    /**
     * Used to check if a category with this name already exists
     * before creating a new one — avoids duplicates.
     * Auto-generated SQL: SELECT * FROM categories WHERE name = ?
     */
    Optional<Category> findByName(String name);

    /**
     * Used to check for duplicate names when updating a category.
     * Auto-generated SQL: SELECT * FROM categories WHERE name = ? AND id != ?
     */
    boolean existsByNameAndIdNot(String name, Long id);
}
