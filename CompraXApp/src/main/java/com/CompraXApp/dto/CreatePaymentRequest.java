package com.CompraXApp.dto;


import com.CompraXApp.model.Payment;
import lombok.Data;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

@Data
public class CreatePaymentRequest {
    @NotNull
    private Long orderId;

    @NotNull
    private Payment.PaymentMethod method;

    @NotNull
    @Positive
    private BigDecimal amount;
}