package com.lankafresh.backend.cartorder.service;

import com.lankafresh.backend.cartorder.model.Payment;
import com.lankafresh.backend.cartorder.model.PaymentStatus;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.UUID;

@Service
public class PaymentService {

    public Payment process(BigDecimal amount, String method, String cardNumber) {
        String transactionId = "MOCK-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase();

        PaymentStatus status = cardNumber != null && cardNumber.trim().endsWith("0000")
                ? PaymentStatus.FAILED
                : PaymentStatus.SUCCESS;

        return new Payment(amount, method, transactionId, status);
    }
}