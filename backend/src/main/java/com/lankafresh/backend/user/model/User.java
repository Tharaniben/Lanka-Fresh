package com.lankafresh.backend.user.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

/**
 * Every person who logs in through Clerk gets one row here.
 * Created automatically the first time they hit any authenticated endpoint
 * (just-in-time provisioning — no webhook needed).
 *
 * DO NOT add module-specific fields here (e.g. deliveryZone, preferredCategory).
 * Put those in your own module's tables and reference User by id.
 */
@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * The 'sub' claim from Clerk's JWT — uniquely identifies this person
     * across all Clerk sessions. Format: "user_2abc123..."
     */
    @Column(name = "clerk_id", nullable = false, unique = true)
    private String clerkId;

    @Column(name = "email", nullable = false)
    private String email;

    @Column(name = "first_name")
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    /**
     * Stored as a string so it's readable in MySQL.
     * Defaults to CUSTOMER for every new sign-up.
     * To promote someone to a staff role, update this column directly in MySQL
     * (or via the admin endpoint once that's built).
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private Role role = Role.CUSTOMER;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public User(String clerkId, String email, String firstName, String lastName) {
        this.clerkId = clerkId;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.role = Role.CUSTOMER;
        this.createdAt = Instant.now();
    }
}
