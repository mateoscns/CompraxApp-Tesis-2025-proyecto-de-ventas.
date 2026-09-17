package com.CompraXApp.service;

import com.CompraXApp.dto.CartDTO;
import com.CompraXApp.dto.CartItemDTO;
import com.CompraXApp.exception.ResourceNotFoundException;
import com.CompraXApp.model.Cart;
import com.CompraXApp.model.Product;
import com.CompraXApp.model.User;
import com.CompraXApp.repository.CartRepository;
import com.CompraXApp.repository.ProductRepository;
import com.CompraXApp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.stream.Collectors;

@Service
@SuppressWarnings("null")
public class CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Transactional
    public Cart getCartByUser(User user) {
        return cartRepository.findByUserId(user.getId())
                .orElseGet(() -> createCartForUser(user));
    }

    @Transactional
    public CartDTO getCartByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        Cart cart = cartRepository.findByUserId(userId)
                .orElseGet(() -> createCartForUser(user));
        return convertToDTO(cart);
    }

    private Cart createCartForUser(User user) {
        Cart newCart = new Cart();
        newCart.setUser(user);
        return cartRepository.save(newCart);
    }

    @Transactional
    public CartDTO addProductToCart(Long userId, Long productId, int quantity) {
        Cart cart = getCartEntityByUserId(userId);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));
        
        if (!product.isActive() || product.getStockQuantity() < quantity) {
            throw new RuntimeException("Product not available or insufficient stock.");
        }

        cart.addItem(product, quantity);
        return convertToDTO(cartRepository.save(cart));
    }

    @Transactional
    public CartDTO updateProductQuantityInCart(Long userId, Long productId, int quantity) {
        Cart cart = getCartEntityByUserId(userId);
        cart.updateItemQuantity(productId, quantity);
        return convertToDTO(cartRepository.save(cart));
    }

    @Transactional
    public CartDTO removeProductFromCart(Long userId, Long productId) {
        Cart cart = getCartEntityByUserId(userId);
        cart.removeItem(productId);
        return convertToDTO(cartRepository.save(cart));
    }

    @Transactional
    public CartDTO clearCart(Long userId) {
        Cart cart = getCartEntityByUserId(userId);
        cart.clear();
        return convertToDTO(cartRepository.save(cart));
    }

    private Cart getCartEntityByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        return cartRepository.findByUserId(userId)
                .orElseGet(() -> createCartForUser(user));
    }

    private CartDTO convertToDTO(Cart cart) {
        CartDTO dto = new CartDTO();
        dto.setId(cart.getId());
        dto.setUserId(cart.getUser().getId());
        dto.setItems(cart.getItems().stream().map(cartItem -> {
            CartItemDTO itemDTO = new CartItemDTO();
            itemDTO.setProductId(cartItem.getProduct().getId());
            itemDTO.setProductName(cartItem.getProduct().getName());
            itemDTO.setQuantity(cartItem.getQuantity());
            itemDTO.setPricePerUnit(cartItem.getPricePerUnit());
            itemDTO.setSubtotal(cartItem.getSubtotal());
            itemDTO.setImageUrl(cartItem.getProduct().getImageUrl());
            return itemDTO;
        }).collect(Collectors.toList()));
        dto.setTotalAmount(cart.getTotalAmount());
        return dto;
    }
}
