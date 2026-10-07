package com.lankafresh.backend.supplierpurchase.model;

import java.time.LocalDate;

import com.lankafresh.backend.productinventory.model.Product;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// A small, flat response shape for near-expiry alerts - avoids returning
// the raw Product entity directly, which would try to serialize its lazy
// `category` relationship and crash.

@Getter
@Setter
@NoArgsConstructor
public class NearExpiryProductDto {

    private Long id;
    private String name;
    private LocalDate expiryDate;

    public NearExpiryProductDto(Long id, String name, LocalDate expiryDate) {
        this.id = id;
        this.name = name;
        this.expiryDate = expiryDate;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public LocalDate getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(LocalDate expiryDate) {
        this.expiryDate = expiryDate;
    }

    public static NearExpiryProductDto from(Product product) {
        return new NearExpiryProductDto(
            product.getId(),
            product.getName(),
            product.getExpiryDate()
        );
    }
}