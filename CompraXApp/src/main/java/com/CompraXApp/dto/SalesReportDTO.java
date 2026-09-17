package com.CompraXApp.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.math.RoundingMode; // ✅ AGREGAR: Import correcto
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class SalesReportDTO {
    private String period;
    private long totalOrders;
    private BigDecimal totalRevenue;
    private BigDecimal averageOrderValue;
    private LocalDateTime periodStart;
    private LocalDateTime periodEnd;    // Constructor que recibe los parámetros de las queries
    public SalesReportDTO(String period, Long totalOrders, BigDecimal totalRevenue,
                         LocalDateTime periodStart, LocalDateTime periodEnd) {
        this.period = period;
        this.totalOrders = totalOrders != null ? totalOrders : 0L;
        this.totalRevenue = totalRevenue != null ? totalRevenue : BigDecimal.ZERO;

        // ✅ CORREGIDO: Usar RoundingMode.HALF_UP en lugar de BigDecimal.ROUND_HALF_UP
        this.averageOrderValue = this.totalOrders > 0 ?
            this.totalRevenue.divide(BigDecimal.valueOf(this.totalOrders), 2, RoundingMode.HALF_UP) :
            BigDecimal.ZERO;

        this.periodStart = periodStart;
        this.periodEnd = periodEnd;
    }
}
