package com.CompraXApp.controller;

import com.CompraXApp.dto.CartDTO;
import com.CompraXApp.security.UserDetailsImpl;
import com.CompraXApp.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@PreAuthorize("hasRole('USER')")
public class CartController {

    @Autowired
    private CartService cartService;

    // CORREGIR: Usar CartDTO en lugar de Cart y UserDetailsImpl
    @GetMapping
    public ResponseEntity<CartDTO> getCart(@AuthenticationPrincipal UserDetailsImpl currentUser) {
        CartDTO cart = cartService.getCartByUserId(currentUser.getId());
        return ResponseEntity.ok(cart);
    }

    @PostMapping("/items")
    public ResponseEntity<CartDTO> addProductToCart(@AuthenticationPrincipal UserDetailsImpl currentUser,
                                                    @RequestParam Long productId,
                                                    @RequestParam int quantity) {
        CartDTO cart = cartService.addProductToCart(currentUser.getId(), productId, quantity);
        return ResponseEntity.ok(cart);
    }

    @PutMapping("/items/{productId}")
    public ResponseEntity<CartDTO> updateProductQuantity(@AuthenticationPrincipal UserDetailsImpl currentUser,
                                                         @PathVariable Long productId,
                                                         @RequestParam int quantity) {
        CartDTO cart = cartService.updateProductQuantityInCart(currentUser.getId(), productId, quantity);
        return ResponseEntity.ok(cart);
    }

    @DeleteMapping("/items/{productId}")
    public ResponseEntity<CartDTO> removeProductFromCart(@AuthenticationPrincipal UserDetailsImpl currentUser,
                                                         @PathVariable Long productId) {
        CartDTO cart = cartService.removeProductFromCart(currentUser.getId(), productId);
        return ResponseEntity.ok(cart);
    }

    @DeleteMapping
    public ResponseEntity<CartDTO> clearCart(@AuthenticationPrincipal UserDetailsImpl currentUser) {
        CartDTO cart = cartService.clearCart(currentUser.getId());
        return ResponseEntity.ok(cart);
    }
}
