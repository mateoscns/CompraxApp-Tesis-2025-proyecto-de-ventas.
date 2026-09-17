package com.CompraXApp.service;

import com.CompraXApp.exception.ResourceNotFoundException;
import com.CompraXApp.model.Order;
import com.CompraXApp.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@SuppressWarnings("null")
public class ShippingService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private EmailService emailService;

    public void updateShippingStatus(Long orderId, Order.ShippingStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        order.setShippingStatus(status);

        if (status == Order.ShippingStatus.SHIPPED) {
            order.setShippingDate(LocalDateTime.now());
            order.setTrackingNumber(generateTrackingNumber());
        }

        orderRepository.save(order);

        // Enviar notificación por email
        emailService.sendShippingUpdateEmail(order.getUser().getEmail(), order, status);
    }

    private String generateTrackingNumber() {
        return "CX" + System.currentTimeMillis();
    }
}