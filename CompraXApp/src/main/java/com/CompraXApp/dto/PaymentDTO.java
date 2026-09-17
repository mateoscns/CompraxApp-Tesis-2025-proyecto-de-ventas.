package com.CompraXApp.dto;


import com.CompraXApp.model.Payment;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class PaymentDTO {
    private Long id;
    private Long orderId;
    private Payment.PaymentMethod method;
    private Payment.PaymentStatus status;
    private BigDecimal amount;
    private String externalPaymentId;
    private LocalDateTime paymentDate;
}