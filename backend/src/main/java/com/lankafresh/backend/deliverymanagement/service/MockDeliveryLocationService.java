package com.lankafresh.backend.deliverymanagement.service;

import org.springframework.stereotype.Service;

import java.util.Random;

/**
 * Internal mock in deliverymanagement/ that stores/returns simulated
 * coordinates for a delivery, per PRD 4.8:
 * "a coordinate that steps closer to the destination on each poll."
 *
 * No real Google Maps API key exists in this build — do not wire one up
 * here, per PRD 3.3 / 4.8.
 */
@Service
public class MockDeliveryLocationService {

    private static final Random RANDOM = new Random();

    // Roughly Colombo/Negombo area — used only as a plausible starting
    // point for a demo coordinate. Adjust to your own test data as needed.
    private static final double DEFAULT_START_LAT = 6.9271;
    private static final double DEFAULT_START_LNG = 79.8612;

    public double[] initialCoordinates() {
        return new double[]{DEFAULT_START_LAT, DEFAULT_START_LNG};
    }

    /**
     * Simulates one polling step of a driver moving toward the destination.
     * Steps ~10% of the remaining distance each call, with a small amount
     * of jitter so consecutive polls don't look perfectly linear.
     */
    public double[] stepToward(double currentLat, double currentLng,
                                double destLat, double destLng) {
        double stepFraction = 0.10;
        double jitter = 0.0005;

        double newLat = currentLat + (destLat - currentLat) * stepFraction
                + (RANDOM.nextDouble() - 0.5) * jitter;
        double newLng = currentLng + (destLng - currentLng) * stepFraction
                + (RANDOM.nextDouble() - 0.5) * jitter;

        return new double[]{newLat, newLng};
    }
}
