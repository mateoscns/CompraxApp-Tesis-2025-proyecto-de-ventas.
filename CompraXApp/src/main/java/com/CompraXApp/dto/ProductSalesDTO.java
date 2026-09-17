package com.CompraXApp.dto;

import lombok.Data;
import lombok.NoArgsConstructor; 
import java.math.BigDecimal;

@Data
@NoArgsConstructor
public class ProductSalesDTO {
    private Long productId;
    private String productName;
    private long totalQuantitySold; 
    private BigDecimal totalRevenue;


    public ProductSalesDTO(Long productId, String productName, Long totalQuantitySold, BigDecimal totalRevenue) {
        this.productId = productId;
        this.productName = productName;
        this.totalQuantitySold = totalQuantitySold != null ? totalQuantitySold : 0L;
        this.totalRevenue = totalRevenue;
    }
}
