package com.lankafresh.backend.productinventory.repository;

import com.lankafresh.backend.productinventory.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Database operations for Product.
 * Spring Data JPA generates all SQL automatically from method names.
 */
@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    /** All active products — used for the customer-facing product listing page. */
    List<Product> findByActiveTrue();

    /** All products in a specific category — used for category filtering. */
    List<Product> findByCategoryIdAndActiveTrue(Long categoryId);

    /** All products including inactive — used by inventory staff view. */
    List<Product> findByCategoryId(Long categoryId);
}
