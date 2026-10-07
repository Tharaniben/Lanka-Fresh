package com.lankafresh.backend.cartorder.model;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@AllArgsConstructor
public class OrderResponseDto {
    private Long id;
    private String deliveryAddress;
    private List<OrderItemResponseDto> items;
    private BigDecimal subtotal;
    private BigDecimal deliveryFee;
    private BigDecimal grandTotal;
    private OrderStatus status;
    private Instant createdAt;
    private String paymentTransactionId;
    private PaymentStatus paymentStatus;
    private String customerName;
    private String customerEmail;

    public static OrderResponseDto from(Order order, Payment payment) {
        String name = null;
        String email = null;
        if (order.getUser() != null) {
            String first = order.getUser().getFirstName() != null ? order.getUser().getFirstName() : "";
            String last = order.getUser().getLastName() != null ? order.getUser().getLastName() : "";
            name = (first + " " + last).trim();
            if (name.isEmpty()) {
                name = order.getUser().getEmail() != null ? order.getUser().getEmail() : "Customer #" + order.getUser().getId();
            }
            email = order.getUser().getEmail();
        }

        String txId = payment != null ? payment.getTransactionId() : null;
        PaymentStatus pStatus = payment != null ? payment.getStatus() : null;

        return new OrderResponseDto(
                order.getId(),
                order.getDeliveryAddress(),
                order.getItems().stream().map(OrderItemResponseDto::from).collect(Collectors.toList()),
                order.getSubtotal(),
                order.getDeliveryFee(),
                order.getGrandTotal(),
                order.getStatus(),
                order.getCreatedAt(),
                txId,
                pStatus,
                name,
                email
        );
    }

    public static OrderResponseDto from(Order order) {
        return from(order, null);
    }
}