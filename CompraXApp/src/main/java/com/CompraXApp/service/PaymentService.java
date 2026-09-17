package com.CompraXApp.service;

import com.CompraXApp.dto.PaymentDTO;
import com.CompraXApp.model.Payment;
import com.CompraXApp.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PaymentService {
    
    @Autowired
    private PaymentRepository paymentRepository;
    
    public List<PaymentDTO> getPaymentsByUserId(Long userId) {
        return paymentRepository.findByOrder_User_Id(userId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public List<PaymentDTO> getAllPayments() {
        return paymentRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    private PaymentDTO convertToDTO(Payment payment) {
        PaymentDTO dto = new PaymentDTO();
        dto.setId(payment.getId());
        dto.setOrderId(payment.getOrder().getId());
        dto.setMethod(payment.getMethod());
        dto.setStatus(payment.getStatus());
        dto.setAmount(payment.getAmount());
        dto.setExternalPaymentId(payment.getExternalPaymentId());
        dto.setPaymentDate(payment.getPaymentDate());
        return dto;
    }
}
