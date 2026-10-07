package com.lankafresh.backend.complaintrelations.model;

/**
 * Broad bucket for a complaint, mainly so the CRO can filter/triage the queue.
 */
public enum ComplaintCategory {
    DELIVERY,
    PRODUCT_QUALITY,
    BILLING_PAYMENT,
    CUSTOMER_SERVICE,
    OTHER
}
