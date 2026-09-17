package com.CompraXApp.service;

import com.CompraXApp.dto.OrderDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class MercadoPagoService {
    
    @Value("${mercadopago.payment.link}")
    private String mercadoPagoPaymentLink;

    public String createPaymentLink(OrderDTO order) {
        System.out.println("✅ Generando link de pago para pedido #" + order.getId());
        System.out.println("💰 Monto: $" + order.getTotalAmount());
        System.out.println("🔗 Link de pago: " + mercadoPagoPaymentLink);
        
        return mercadoPagoPaymentLink;
    }

    public Map<String, Object> getPaymentInstructions(OrderDTO order) {
        Map<String, Object> instructions = new HashMap<>();
        instructions.put("paymentLink", createPaymentLink(order));
        instructions.put("amount", order.getTotalAmount());
        instructions.put("orderId", order.getId());
        instructions.put("instructions", 
            "1. Haz clic en el link de pago\n" +
            "2. Completa el pago en MercadoPago\n" +
            "3. Anota tu ID de transacción\n" +
            "4. Regresa y reporta el pago con el ID de transacción");
        
        return instructions;
    }
}