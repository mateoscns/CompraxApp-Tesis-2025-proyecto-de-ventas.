package com.CompraXApp.service;

import com.CompraXApp.dto.OrderDTO;
import org.springframework.beans.factory.annotation.Value; 
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.stream.Collectors;

@Service
public class WhatsAppService {

    @Value("${whatsapp.business.phone}")
    private String businessPhone;

    public String generateWhatsAppLink(OrderDTO order) {
        String message = String.format(
                "Hola! Quiero coordinar el pago de mi pedido #%d por $%.2f. " +
                        "Productos: %s",
                order.getId(),
                order.getTotalAmount(),
                order.getItems().stream()
                        .map(item -> item.getProductName() + " x" + item.getQuantity())
                        .collect(Collectors.joining(", "))
        );

        String encodedMessage = URLEncoder.encode(message, StandardCharsets.UTF_8);
        return String.format("https://wa.me/%s?text=%s", businessPhone, encodedMessage);
    }
}