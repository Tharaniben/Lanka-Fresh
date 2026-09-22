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

    public static OrderResponseDto from(Order order, Payment payment) {
        return new OrderResponseDto(
                order.getId(), order.getDeliveryAddress(),
                order.getItems().stream().map(OrderItemResponseDto::from).collect(Collectors.toList()),
                order.getSubtotal(), order.getDeliveryFee(), order.getGrandTotal(),
                order.getStatus(), order.getCreatedAt(),
                payment.getTransactionId(), payment.getStatus()
        );
    }

    public static OrderResponseDto from(Order order) {
        return new OrderResponseDto(
                order.getId(), order.getDeliveryAddress(),
                order.getItems().stream().map(OrderItemResponseDto::from).collect(Collectors.toList()),
                order.getSubtotal(), order.getDeliveryFee(), order.getGrandTotal(),
                order.getStatus(), order.getCreatedAt(),
                null, null
        );
    }
}