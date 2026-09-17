package com.CompraXApp.controller;

import com.CompraXApp.dto.PaymentDTO;
import com.CompraXApp.dto.OrderDTO;
import com.CompraXApp.model.Order;
import com.CompraXApp.model.Payment;
import com.CompraXApp.security.UserDetailsImpl;
import com.CompraXApp.service.PaymentService;
import com.CompraXApp.service.MercadoPagoService;
import com.CompraXApp.service.OrderService;
import com.CompraXApp.repository.OrderRepository;
import com.CompraXApp.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@SuppressWarnings("null")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;
    
    @Autowired
    private MercadoPagoService mercadoPagoService;
    
    @Autowired
    private OrderService orderService;
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private PaymentRepository paymentRepository;

    @GetMapping("/my-payments")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<PaymentDTO>> getMyPayments(@AuthenticationPrincipal UserDetailsImpl currentUser) {
        List<PaymentDTO> payments = paymentService.getPaymentsByUserId(currentUser.getId());
        return ResponseEntity.ok(payments);
    }

    @GetMapping("/history/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<PaymentDTO>> getPaymentHistory(@PathVariable Long userId) {
        List<PaymentDTO> payments = paymentService.getPaymentsByUserId(userId);
        return ResponseEntity.ok(payments);
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<PaymentDTO>> getAllPayments() {
        List<PaymentDTO> payments = paymentService.getAllPayments();
        return ResponseEntity.ok(payments);
    }

    // SIMPLIFICADO: Solo generar link de pago
    @PostMapping("/mercadopago/generate-link")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> generateMercadoPagoLink(@RequestParam Long orderId,
                                                    @AuthenticationPrincipal UserDetailsImpl currentUser) {
        try {
            // Obtener la orden y verificar permisos
            OrderDTO order = orderService.getOrderByIdForUser(orderId, currentUser.getId());
            
            // Crear registro de pago pendiente
            Order orderEntity = orderRepository.findById(orderId)
                    .orElseThrow(() -> new RuntimeException("Order not found"));
            
            Payment payment = new Payment();
            payment.setOrder(orderEntity);
            payment.setMethod(Payment.PaymentMethod.MERCADO_PAGO);
            payment.setStatus(Payment.PaymentStatus.PENDING);
            payment.setAmount(order.getTotalAmount());
            payment.setPaymentDate(LocalDateTime.now());
            
            Payment savedPayment = paymentRepository.save(payment);
            
            // Generar instrucciones de pago con link
            Map<String, Object> paymentInstructions = mercadoPagoService.getPaymentInstructions(order);
            paymentInstructions.put("paymentId", savedPayment.getId());
            
            return ResponseEntity.ok(paymentInstructions);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }
    
    // SIMPLIFICADO: Solo para que el usuario reporte el ID de transacción
    @PostMapping("/confirm-payment/{paymentId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> confirmPayment(@PathVariable Long paymentId,
                                           @RequestParam String transactionId,
                                           @AuthenticationPrincipal UserDetailsImpl currentUser) {
        try {
            Payment payment = paymentRepository.findById(paymentId)
                    .orElseThrow(() -> new RuntimeException("Payment not found"));
            
            // Verificar que el pago pertenece al usuario
            if (!payment.getOrder().getUser().getId().equals(currentUser.getId())) {
                return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
            }
            
            // Actualizar pago con ID de transacción
            payment.setExternalPaymentId(transactionId);
            payment.setStatus(Payment.PaymentStatus.PENDING); // Pending hasta confirmación admin
            paymentRepository.save(payment);
            
            return ResponseEntity.ok(Map.of(
                "message", "Pago reportado exitosamente. Será verificado en breve.",
                "paymentId", paymentId,
                "transactionId", transactionId
            ));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<PaymentDTO>> getPendingPayments() {
        List<PaymentDTO> pendingPayments = paymentService.getAllPayments()
                .stream()
                .filter(payment -> payment.getStatus() == Payment.PaymentStatus.PENDING)
                .toList();
        
        return ResponseEntity.ok(pendingPayments);
    }
}