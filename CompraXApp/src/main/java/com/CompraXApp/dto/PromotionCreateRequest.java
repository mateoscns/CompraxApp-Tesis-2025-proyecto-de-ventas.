package com.CompraXApp.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class PromotionCreateRequest {
    
    @NotBlank(message = "El título es requerido")
    @Size(max = 100, message = "El título no puede exceder 100 caracteres")
    private String title;
    
    @NotBlank(message = "La descripción es requerida")
    @Size(max = 500, message = "La descripción no puede exceder 500 caracteres")
    private String description;
    
    @NotNull(message = "El porcentaje de descuento es requerido")
    @DecimalMin(value = "0.01", message = "El descuento debe ser mayor a 0")
    @DecimalMax(value = "100.00", message = "El descuento no puede ser mayor a 100%")
    private BigDecimal discountPercentage;
    
    @NotNull(message = "La fecha de inicio es requerida")
    @Future(message = "La fecha de inicio debe ser futura")
    private LocalDateTime startDate;
    
    @NotNull(message = "La fecha de fin es requerida")
    @Future(message = "La fecha de fin debe ser futura")
    private LocalDateTime endDate;
    
    private Boolean active = true;
    
    // Constructor
    public PromotionCreateRequest(String title, String description, BigDecimal discountPercentage,
                                LocalDateTime startDate, LocalDateTime endDate) {
        this.title = title;
        this.description = description;
        this.discountPercentage = discountPercentage;
        this.startDate = startDate;
        this.endDate = endDate;
    }
}
