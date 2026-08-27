package com.lankafresh.backend.productinventory.repository;

import com.lankafresh.backend.productinventory.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

/**
 * Database operations for Product.
 * Spring Data JPA generates all SQL automatically from method names.
 */
@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    /** All active products — used for general queries. */
    List<Product> findByActiveTrue();

    /** All active and non-expired products — customer-facing listing. */
    @Query("SELECT p FROM Product p WHERE p.active = true AND (p.expiryDate IS NULL OR p.expiryDate >= :today)")
    List<Product> findActiveNonExpired(@Param("today") LocalDate today);

    /** All active and non-expired products in a specific category. */
    @Query("SELECT p FROM Product p WHERE p.category.id = :categoryId AND p.active = true AND (p.expiryDate IS NULL OR p.expiryDate >= :today)")
    List<Product> findByCategoryIdAndActiveNonExpired(@Param("categoryId") Long categoryId, @Param("today") LocalDate today);

    /** All products in a specific category — used for category filtering. */
    List<Product> findByCategoryIdAndActiveTrue(Long categoryId);

    /** All products including inactive — used by inventory staff view. */
    List<Product> findByCategoryId(Long categoryId);
}
