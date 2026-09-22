package com.lankafresh.backend.cartorder.model;

/**
 * Lifecycle of an order. Stored as a string (@Enumerated(EnumType.STRING))
 * so it stays human-readable in MySQL.
 */
public enum OrderStatus {
    PLACED,
    CONFIRMED,
    OUT_FOR_DELIVERY,
    DELIVERED,
    CANCELLED
}
