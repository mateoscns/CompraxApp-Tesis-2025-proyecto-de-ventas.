package com.CompraXApp.service;

import com.CompraXApp.model.Order;
import com.CompraXApp.model.Payment; // ← AGREGAR ESTE IMPORT
import com.CompraXApp.model.Promotion;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendPasswordResetEmail(String to, String subject, String text) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);
        mailSender.send(message);
    }

    public void sendPaymentConfirmationEmail(String to, Order order, Payment payment) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject("Confirmación de pago - Pedido #" + order.getId());
        message.setText("Hola " + order.getUser().getName() + ",\n\n" +
                "Tu pago de $" + payment.getAmount() + " ha sido confirmado.\n" +
                "Método de pago: " + payment.getMethod() + "\n" +
                "Estado: " + payment.getStatus() + "\n\n" +
                "¡Gracias por tu compra!\n\n" +
                "Saludos,\nEl equipo de CompraXApp");
        mailSender.send(message);
    }

    public void sendVerificationEmail(String to, String code) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject("Verifica tu cuenta en CompraXApp");
        message.setText("Hola,\n\nGracias por registrarte en CompraXApp.\n" +
                        "Tu código de verificación es: " + code + "\n\n" +
                        "Este código expirará en 15 minutos.\n\n" +
                        "Saludos,\nEl equipo de CompraXApp");
        mailSender.send(message);
        System.out.println("Email de verificación enviado a: " + to);
    }

    public void sendShippingUpdateEmail(String to, Order order, Order.ShippingStatus status) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject("Actualización de tu pedido #" + order.getId());
        
        String statusMessage;
        switch (status) {
            case SHIPPED:
                statusMessage = "Tu pedido ha sido enviado. Número de seguimiento: " + order.getTrackingNumber();
                break;
            case IN_TRANSIT:
                statusMessage = "Tu pedido está en tránsito.";
                break;
            case DELIVERED:
                statusMessage = "Tu pedido ha sido entregado.";
                break;
            default:
                statusMessage = "El estado de tu pedido ha sido actualizado a: " + status;
        }
        
        message.setText("Hola,\n\n" + statusMessage + "\n\nGracias por tu compra.\n\nSaludos,\nEl equipo de CompraXApp");
        mailSender.send(message);
    }

    public void sendPromotionEmail(String to, List<Promotion> promotions) {
        if (promotions.isEmpty()) return;
        
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject("¡Nuevas promociones disponibles!");
        
        StringBuilder content = new StringBuilder("Hola,\n\n¡Tenemos promociones especiales para ti!\n\n");
        for (Promotion promo : promotions) {
            content.append("• ").append(promo.getTitle()).append("\n");
            if (promo.getDescription() != null) {
                content.append("  ").append(promo.getDescription()).append("\n");
            }
            content.append("\n");
        }
        content.append("¡No te las pierdas!\n\nSaludos,\nEl equipo de CompraXApp");
        
        message.setText(content.toString());
        mailSender.send(message);
    }

    public void sendOrderConfirmationEmail(String to, Order order) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject("Confirmación de pedido #" + order.getId());
        message.setText("Hola " + order.getUser().getName() + ",\n\n" +
                "Tu pedido #" + order.getId() + " ha sido registrado exitosamente.\n" +
                "Total: $" + order.getTotalAmount() + "\n" +
                "Estado: " + order.getStatus() + "\n\n" +
                "Te notificaremos cuando tengamos actualizaciones.\n\n" +
                "¡Gracias por tu compra!\n\n" +
                "Saludos,\nEl equipo de CompraXApp");
        mailSender.send(message);
    }
}