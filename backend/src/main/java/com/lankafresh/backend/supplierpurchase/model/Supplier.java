package com.lankafresh.backend.supplierpurchase.model;

import java.time.LocalDateTime;


import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "suppliers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

public class Supplier {

     @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Supplier name is required")
    @Column(nullable = false)
    private String name;

    @NotBlank(message = "Contact person is required")
    @Column(nullable = false)
    private String contactPerson;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^[0-9+\\-\\s]{7,15}$", message = "Phone number format is invalid")
    @Column(nullable = false)
    private String phone;

    @Email(message = "Email must be a valid email address")
    private String email;

    private String address;

    @Column(columnDefinition = "TEXT")
    private String suppliedItems;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

}
