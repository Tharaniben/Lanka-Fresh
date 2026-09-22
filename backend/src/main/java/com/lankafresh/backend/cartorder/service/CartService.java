package com.lankafresh.backend.cartorder.service;

import com.lankafresh.backend.cartorder.model.Cart;
import com.lankafresh.backend.cartorder.model.CartItem;
import com.lankafresh.backend.cartorder.model.CartItemResponseDto;
import com.lankafresh.backend.cartorder.model.CartResponseDto;
import com.lankafresh.backend.cartorder.repository.CartItemRepository;
import com.lankafresh.backend.cartorder.repository.CartRepository;
import com.lankafresh.backend.config.ResourceNotFoundException;
import com.lankafresh.backend.productinventory.model.Product;
import com.lankafresh.backend.productinventory.repository.ProductRepository;
import com.lankafresh.backend.user.model.User;
import com.lankafresh.backend.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CartService {

    /** Orders of 3000 LKR or more ship free; below that a flat delivery fee applies. */
    private static final BigDecimal FREE_DELIVERY_THRESHOLD = new BigDecimal("3000.00");
    private static final BigDecimal DELIVERY_FEE = new BigDecimal("350.00");

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public CartService(CartRepository cartRepository,
                       CartItemRepository cartItemRepository,
                       ProductRepository productRepository,
                       UserRepository userRepository) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Cart getOrCreateCart(Long userId) {
        return cartRepository.findByUserId(userId).orElseGet(() -> {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            Cart newCart = new Cart(user);
            return cartRepository.save(newCart);
        });
    }

    // READ: full cart with items + calculated totals -- this is what the frontend renders
    @Transactional
    public CartResponseDto getCartForUser(Long userId) {
        Cart cart = getOrCreateCart(userId);
        List<CartItem> cartItems = cartItemRepository.findByCartId(cart.getId());
        return buildCartResponse(cart, cartItems);
    }

    // CREATE / UPDATE: add item, or bump quantity if it's already in the cart
    @Transactional
    public CartResponseDto addItemToCart(Long userId, Long productId, Integer quantity) {
        Cart cart = getOrCreateCart(userId);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        Optional<CartItem> existingItem = cartItemRepository.findByCartIdAndProductId(cart.getId(), productId);

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + quantity);
            cartItemRepository.save(item);
        } else {
            cartItemRepository.save(new CartItem(cart, product, quantity));
        }

        return getCartForUser(userId);
    }

    // UPDATE: set a cart item's quantity to an exact value (the qty input / +/- buttons)
    @Transactional
    public CartResponseDto updateItemQuantity(Long userId, Long cartItemId, Integer quantity) {
        Cart cart = getOrCreateCart(userId);
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found with id: " + cartItemId));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new ResourceNotFoundException("Cart item not found with id: " + cartItemId);
        }

        item.setQuantity(quantity);
        cartItemRepository.save(item);
        return getCartForUser(userId);
    }

    // DELETE: remove a single item from the cart
    @Transactional
    public CartResponseDto removeItemFromCart(Long userId, Long cartItemId) {
        Cart cart = getOrCreateCart(userId);
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found with id: " + cartItemId));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new ResourceNotFoundException("Cart item not found with id: " + cartItemId);
        }

        cartItemRepository.deleteById(cartItemId);
        return getCartForUser(userId);
    }

    // DELETE: empty the whole cart
    @Transactional
    public CartResponseDto clearCart(Long userId) {
        Cart cart = getOrCreateCart(userId);
        cartItemRepository.deleteByCartId(cart.getId());
        return getCartForUser(userId);
    }

    // Shared calculation logic -- used by both the cart view and checkout.
    private CartResponseDto buildCartResponse(Cart cart, List<CartItem> cartItems) {
        List<CartItemResponseDto> itemDtos = cartItems.stream()
                .map(CartItemResponseDto::from)
                .collect(Collectors.toList());

        BigDecimal subtotal = itemDtos.stream()
                .map(CartItemResponseDto::getLineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal deliveryFee = (subtotal.compareTo(BigDecimal.ZERO) == 0
                || subtotal.compareTo(FREE_DELIVERY_THRESHOLD) >= 0)
                ? BigDecimal.ZERO
                : DELIVERY_FEE;

        BigDecimal grandTotal = subtotal.add(deliveryFee);

        return new CartResponseDto(cart.getId(), itemDtos, subtotal, deliveryFee, grandTotal);
    }
}
