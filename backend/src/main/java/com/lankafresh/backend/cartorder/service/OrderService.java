package com.lankafresh.backend.cartorder.service;

import com.lankafresh.backend.cartorder.model.*;
import com.lankafresh.backend.cartorder.repository.CartItemRepository;
import com.lankafresh.backend.cartorder.repository.OrderRepository;
import com.lankafresh.backend.cartorder.repository.PaymentRepository;
import com.lankafresh.backend.config.ResourceNotFoundException;
import com.lankafresh.backend.productinventory.service.ProductService;
import com.lankafresh.backend.user.model.User;
import com.lankafresh.backend.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final CartService cartService;
    private final ProductService productService;
    private final PaymentService paymentService;
    private final PaymentRepository paymentRepository;
    private final NotificationService notificationService;

    public OrderService(OrderRepository orderRepository,
                        CartItemRepository cartItemRepository,
                        UserRepository userRepository,
                        CartService cartService,
                        ProductService productService,
                        PaymentService paymentService,
                        PaymentRepository paymentRepository,
                        NotificationService notificationService) {
        this.orderRepository = orderRepository;
        this.cartItemRepository = cartItemRepository;
        this.userRepository = userRepository;
        this.cartService = cartService;
        this.productService = productService;
        this.paymentService = paymentService;
        this.paymentRepository = paymentRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public OrderResponseDto checkout(Long userId, CheckoutRequestDto body) {
        Cart cart = cartService.getOrCreateCart(userId);
        List<CartItem> cartItems = cartItemRepository.findByCartId(cart.getId());

        if (cartItems.isEmpty()) {
            throw new IllegalStateException("Cannot checkout an empty cart");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        for (CartItem cartItem : cartItems) {
            productService.decrementStock(cartItem.getProduct().getId(), cartItem.getQuantity());
        }

        BigDecimal subtotal = cartItems.stream()
                .map(ci -> ci.getProduct().getPrice().multiply(BigDecimal.valueOf(ci.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal deliveryFee = subtotal.compareTo(new BigDecimal("3000.00")) >= 0
                ? BigDecimal.ZERO
                : new BigDecimal("350.00");

        BigDecimal grandTotal = subtotal.add(deliveryFee);

        Payment payment = paymentService.process(grandTotal, "CARD", body.getCardNumber());
        if (payment.getStatus() == PaymentStatus.FAILED) {
            throw new IllegalStateException(
                    "Payment declined. Please check your card details and try again.");
        }

        Order order = new Order(user, body.getDeliveryAddress(), subtotal, deliveryFee, grandTotal);
        for (CartItem cartItem : cartItems) {
            order.addItem(new OrderItem(
                    cartItem.getProduct(), cartItem.getProduct().getName(),
                    cartItem.getProduct().getPrice(), cartItem.getQuantity()
            ));
        }

        Order savedOrder = orderRepository.save(order);
        payment.setOrder(savedOrder);
        Payment savedPayment = paymentRepository.save(payment);

        cartItemRepository.deleteByCartId(cart.getId());

        notificationService.createNotification(
                user,
                savedOrder.getId(),
                "Order Placed",
                "Your order #" + savedOrder.getId() + " of LKR " + savedOrder.getGrandTotal() + " has been placed successfully."
        );

        return OrderResponseDto.from(savedOrder, savedPayment);
    }

    @Transactional(readOnly = true)
    public List<OrderResponseDto> getOrderHistory(Long userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::toDtoWithPayment)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<OrderResponseDto> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toDtoWithPayment)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OrderResponseDto getOrderById(Long userId, Long orderId, boolean isStaff) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        if (!isStaff && !order.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Order not found with id: " + orderId);
        }

        return toDtoWithPayment(order);
    }

    @Transactional
    public OrderResponseDto updateOrderStatus(Long orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        OrderStatus oldStatus = order.getStatus();
        if (oldStatus == newStatus) {
            return toDtoWithPayment(order);
        }

        if (oldStatus == OrderStatus.CANCELLED) {
            throw new IllegalStateException("Cannot change status of a cancelled order");
        }

        // If transitioning to CANCELLED, restore inventory stock
        if (newStatus == OrderStatus.CANCELLED) {
            for (OrderItem item : order.getItems()) {
                productService.incrementStock(item.getProduct().getId(), item.getQuantity());
            }
        }

        order.setStatus(newStatus);
        Order updatedOrder = orderRepository.save(order);

        notificationService.createNotification(
                order.getUser(),
                order.getId(),
                "Order Status Updated",
                "Your order #" + order.getId() + " status is now " + newStatus + "."
        );

        return toDtoWithPayment(updatedOrder);
    }

    @Transactional
    public OrderResponseDto cancelOrder(Long userId, Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        if (!order.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Order not found with id: " + orderId);
        }

        if (order.getStatus() != OrderStatus.PLACED) {
            throw new IllegalStateException("Only orders in PLACED status can be cancelled. Current status: " + order.getStatus());
        }

        for (OrderItem item : order.getItems()) {
            productService.incrementStock(item.getProduct().getId(), item.getQuantity());
        }

        order.setStatus(OrderStatus.CANCELLED);
        Order updatedOrder = orderRepository.save(order);

        notificationService.createNotification(
                order.getUser(),
                order.getId(),
                "Order Cancelled",
                "Your order #" + order.getId() + " has been cancelled and items returned to stock."
        );

        return toDtoWithPayment(updatedOrder);
    }

    private OrderResponseDto toDtoWithPayment(Order order) {
        Payment payment = paymentRepository.findByOrderId(order.getId()).orElse(null);
        return OrderResponseDto.from(order, payment);
    }
}