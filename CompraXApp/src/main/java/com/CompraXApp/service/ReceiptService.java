package com.CompraXApp.service;

import com.CompraXApp.exception.ResourceNotFoundException;
import com.CompraXApp.model.Order;
import com.CompraXApp.model.OrderItem;
import com.CompraXApp.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;

@Service
@SuppressWarnings("null")
public class ReceiptService {
    
    @Autowired
    private OrderRepository orderRepository;
    
    public String generateReceipt(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
        return buildReceiptContent(order);
    }
    
    private String buildReceiptContent(Order order) {
        StringBuilder receipt = new StringBuilder();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
        
        receipt.append("===============================\n");
        receipt.append("       COMPROBANTE DE COMPRA   \n");
        receipt.append("           CompraXApp           \n");
        receipt.append("===============================\n\n");
        
        receipt.append("Pedido #: ").append(order.getId()).append("\n");
        receipt.append("Fecha: ").append(order.getOrderDate().format(formatter)).append("\n");
        receipt.append("Cliente: ").append(order.getUser().getName()).append("\n");
        receipt.append("Email: ").append(order.getUser().getEmail()).append("\n");
        receipt.append("Estado: ").append(order.getStatus()).append("\n");
        receipt.append("Dirección: ").append(order.getShippingAddress()).append("\n\n");
        
        receipt.append("PRODUCTOS:\n");
        receipt.append("-------------------------------\n");
        
        BigDecimal total = BigDecimal.ZERO;
        for (OrderItem item : order.getItems()) {
            BigDecimal subtotal = item.getPrice().multiply(new BigDecimal(item.getQuantity()));
            receipt.append(String.format("%-20s x%d\n", item.getProductName(), item.getQuantity()));
            receipt.append(String.format("$%.2f c/u - Subtotal: $%.2f\n\n", 
                    item.getPrice(), subtotal));
            total = total.add(subtotal);
        }
        
        receipt.append("-------------------------------\n");
        receipt.append(String.format("TOTAL: $%.2f\n", total));
        receipt.append("===============================\n");
        receipt.append("    ¡Gracias por tu compra!    \n");
        receipt.append("===============================");
        
        return receipt.toString();
    }
}
