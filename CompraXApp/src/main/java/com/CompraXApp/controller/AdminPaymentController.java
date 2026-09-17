package com.CompraXApp.controller;

import com.CompraXApp.dto.PaymentDTO;
import com.CompraXApp.model.Payment;
import com.CompraXApp.service.PaymentService;
import com.CompraXApp.repository.PaymentRepository;
import com.CompraXApp.repository.OrderRepository;
import com.CompraXApp.service.EmailService;
import com.CompraXApp.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/payments")
@PreAuthorize("hasRole('ADMIN')")
@SuppressWarnings("null")
public class AdminPaymentController {

    @Autowired
    private PaymentService paymentService;
    
    @Autowired
    private PaymentRepository paymentRepository;
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private EmailService emailService;
    
    @Autowired
    private NotificationService notificationService; 

    @GetMapping("/pending")
    public ResponseEntity<List<PaymentDTO>> getPendingPayments() {
        List<PaymentDTO> pendingPayments = paymentService.getAllPayments()
                .stream()
                .filter(payment -> payment.getStatus().name().equals("PENDING"))
                .toList();
        
        return ResponseEntity.ok(pendingPayments);
    }

    @GetMapping("/all")
    public ResponseEntity<List<PaymentDTO>> getAllPayments() {
        return ResponseEntity.ok(paymentService.getAllPayments());
    }

    // SIMPLIFICADO: Confirmar pago directamente aquí
    @PostMapping("/{paymentId}/confirm")
    public ResponseEntity<?> confirmPayment(@PathVariable Long paymentId) {
        try {
            Payment payment = paymentRepository.findById(paymentId)
                    .orElseThrow(() -> new RuntimeException("Payment not found"));
                    
            payment.setStatus(Payment.PaymentStatus.COMPLETED);
            paymentRepository.save(payment);
            
            // Actualizar orden
            var order = payment.getOrder();
            order.setStatus(com.CompraXApp.model.Order.OrderStatus.PROCESSING);
            orderRepository.save(order);
            
            // ✅ AGREGAR: Crear notificación de pago confirmado
            notificationService.createPaymentConfirmationNotification(order);
            
            // Enviar email de confirmación
            emailService.sendPaymentConfirmationEmail(
                order.getUser().getEmail(), 
                order, 
                payment
            );
            
            return ResponseEntity.ok(Map.of("message", "Payment confirmed successfully"));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }
}
