package com.CompraXApp.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Data
@NoArgsConstructor
public class UserPurchaseStatisticsDTO {
    private Long userId;
    private String userName;
    private String userEmail;
    private long totalOrders;
    private BigDecimal totalSpent;
    private BigDecimal averageOrderValue;
    private String mostPurchasedProduct;    public UserPurchaseStatisticsDTO(Long userId, String userName, String userEmail,
                                   Long totalOrders, BigDecimal totalSpent) {
        this.userId = userId;
        this.userName = userName;
        this.userEmail = userEmail;
        this.totalOrders = totalOrders != null ? totalOrders : 0L;
        this.totalSpent = totalSpent != null ? totalSpent : BigDecimal.ZERO;
        this.averageOrderValue = this.totalOrders > 0 ?
            this.totalSpent.divide(BigDecimal.valueOf(this.totalOrders), 2, RoundingMode.HALF_UP) :
            BigDecimal.ZERO;
    }
}
