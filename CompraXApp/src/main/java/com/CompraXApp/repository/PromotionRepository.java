package com.CompraXApp.repository;

import com.CompraXApp.model.Promotion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PromotionRepository extends JpaRepository<Promotion, Long> {
    
    @Override
    @NonNull
    Optional<Promotion> findById(@NonNull Long id);
    
    @Override
    boolean existsById(@NonNull Long id);
    
    @Override
    void deleteById(@NonNull Long id);
    
    List<Promotion> findByActiveTrue();
}
