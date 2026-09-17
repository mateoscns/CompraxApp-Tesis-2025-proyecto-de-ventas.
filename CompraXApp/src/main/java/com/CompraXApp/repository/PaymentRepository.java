package com.CompraXApp.repository;

import com.CompraXApp.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    
    @Override
    @NonNull
    Optional<Payment> findById(@NonNull Long id);
    
    List<Payment> findByOrder_User_Id(Long userId);
    List<Payment> findByStatus(Payment.PaymentStatus status);
    List<Payment> findByMethod(Payment.PaymentMethod method);
}
