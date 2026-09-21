package com.lankafresh.backend.supplierpurchase.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.lankafresh.backend.supplierpurchase.model.Supplier;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Long> {

    List<Supplier> findByNameContainingIgnoreCase(String name);


@Query("SELECT s FROM Supplier s WHERE " +
           "(:name IS NULL OR LOWER(s.name) LIKE LOWER(CONCAT('%', :name, '%'))) AND " +
           "(:contactPerson IS NULL OR LOWER(s.contactPerson) LIKE LOWER(CONCAT('%', :contactPerson, '%'))) AND " +
           "(:dateFrom IS NULL OR s.createdAt >= :dateFrom) AND " +
           "(:dateTo IS NULL OR s.createdAt <= :dateTo)")
    List<Supplier> search(
            @Param("name") String name,
            @Param("contactPerson") String contactPerson,
            @Param("dateFrom") LocalDateTime dateFrom,
            @Param("dateTo") LocalDateTime dateTo);

    }
