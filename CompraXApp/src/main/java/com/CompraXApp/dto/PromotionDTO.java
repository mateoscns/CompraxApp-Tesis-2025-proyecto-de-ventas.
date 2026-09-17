package com.CompraXApp.dto;

import com.CompraXApp.model.Promotion;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class PromotionDTO {
    private Long id;
    private String title;
    private String description;
    private BigDecimal discountPercentage;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private boolean active;
    private LocalDateTime createdAt;
    
    // Constructor desde entidad
    public PromotionDTO(Promotion promotion) {
        this.id = promotion.getId();
        this.title = promotion.getTitle();
        this.description = promotion.getDescription();
        this.discountPercentage = promotion.getDiscountPercentage();
        this.startDate = promotion.getStartDate();
        this.endDate = promotion.getEndDate();
        this.active = promotion.isActive();
        // Si añades createdAt al modelo, descomenta esta línea:
        // this.createdAt = promotion.getCreatedAt();
    }
}
