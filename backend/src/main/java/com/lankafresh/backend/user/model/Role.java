package com.lankafresh.backend.user.model;

/**
 * All possible roles in the system. Stored as strings in the database
 * (@Enumerated(EnumType.STRING)) so the values are human-readable in MySQL
 * and won't silently break if the enum order ever changes.
 */
public enum Role {
    CUSTOMER,
    SALES_STAFF,
    INVENTORY_STAFF,
    DELIVERY_STAFF,
    CRO,            // Customer Relations Officer
    BRANCH_MANAGER,
    ADMIN
}
