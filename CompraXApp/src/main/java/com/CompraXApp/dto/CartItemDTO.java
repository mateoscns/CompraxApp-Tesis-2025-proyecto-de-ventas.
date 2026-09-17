package com.CompraXApp.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class CartItemDTO {
    private Long productId;
    private String productName;
    private int quantity;
    private BigDecimal pricePerUnit;
    private BigDecimal subtotal;
    private String imageUrl; 
}
