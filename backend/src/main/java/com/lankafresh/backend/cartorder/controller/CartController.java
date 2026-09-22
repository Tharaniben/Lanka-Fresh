package com.lankafresh.backend.cartorder.controller;

import com.lankafresh.backend.cartorder.model.AddCartItemRequestDto;
import com.lankafresh.backend.cartorder.model.CartResponseDto;
import com.lankafresh.backend.cartorder.model.UpdateCartItemRequestDto;
import com.lankafresh.backend.cartorder.service.CartService;
import com.lankafresh.backend.config.ApiResponse;
import com.lankafresh.backend.config.BaseController;
import com.lankafresh.backend.user.model.User;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST endpoints for the shopping cart.
 * Base path: /api/v1/cart
 *
 * The user is never taken from the request body/params -- it's read off the
 * verified Clerk JWT (see JwtUserFilter / BaseController.getCurrentUser),
 * so nobody can view or edit another user's cart by guessing an id.
 *
 * GET    /api/v1/cart               -- current user's cart, items + totals
 * POST   /api/v1/cart/items         -- add a product to the cart
 * PUT    /api/v1/cart/items/{id}    -- change a cart item's quantity
 * DELETE /api/v1/cart/items/{id}    -- remove one item from the cart
 * DELETE /api/v1/cart               -- clear the whole cart
 */
@RestController
@RequestMapping("/api/v1/cart")
@RequiredArgsConstructor
public class CartController extends BaseController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<ApiResponse<CartResponseDto>> getMyCart(HttpServletRequest request) {
        User user = getCurrentUser(request);
        return ResponseEntity.ok(ApiResponse.success(cartService.getCartForUser(user.getId())));
    }

    @PostMapping("/items")
    public ResponseEntity<ApiResponse<CartResponseDto>> addItemToCart(
            HttpServletRequest request,
            @Valid @RequestBody AddCartItemRequestDto body) {
        User user = getCurrentUser(request);
        CartResponseDto cart = cartService.addItemToCart(user.getId(), body.getProductId(), body.getQuantity());
        return ResponseEntity.ok(ApiResponse.success(cart));
    }

    @PutMapping("/items/{cartItemId}")
    public ResponseEntity<ApiResponse<CartResponseDto>> updateItemQuantity(
            HttpServletRequest request,
            @PathVariable Long cartItemId,
            @Valid @RequestBody UpdateCartItemRequestDto body) {
        User user = getCurrentUser(request);
        CartResponseDto cart = cartService.updateItemQuantity(user.getId(), cartItemId, body.getQuantity());
        return ResponseEntity.ok(ApiResponse.success(cart));
    }

    @DeleteMapping("/items/{cartItemId}")
    public ResponseEntity<ApiResponse<CartResponseDto>> removeItemFromCart(
            HttpServletRequest request,
            @PathVariable Long cartItemId) {
        User user = getCurrentUser(request);
        CartResponseDto cart = cartService.removeItemFromCart(user.getId(), cartItemId);
        return ResponseEntity.ok(ApiResponse.success(cart));
    }

    @DeleteMapping
    public ResponseEntity<ApiResponse<CartResponseDto>> clearCart(HttpServletRequest request) {
        User user = getCurrentUser(request);
        return ResponseEntity.ok(ApiResponse.success(cartService.clearCart(user.getId())));
    }
}
