package com.lankafresh.backend.complaintrelations.model;

/**
 * Lifecycle of a complaint.
 * OPEN            -> just submitted by the customer, not yet looked at
 * IN_PROGRESS     -> a CRO has picked it up and is working on it
 * RESOLVED        -> CRO has resolved it and left resolution notes
 * CLOSED          -> resolved and confirmed closed (no further action expected)
 */
public enum ComplaintStatus {
    OPEN,
    IN_PROGRESS,
    RESOLVED,
    CLOSED
}
