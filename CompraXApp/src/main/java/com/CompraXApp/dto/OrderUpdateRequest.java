package com.CompraXApp.dto;

import com.CompraXApp.model.Order;
import lombok.Data;

@Data
public class OrderUpdateRequest {
    private String status;
    private String shippingStatus;
    
    public OrderUpdateRequest() {}
    
    // Getters y setters
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public String getShippingStatus() { return shippingStatus; }
    public void setShippingStatus(String shippingStatus) { this.shippingStatus = shippingStatus; }
    
    // Métodos de validación
    public Order.OrderStatus getOrderStatus() {
        return status != null ? Order.OrderStatus.valueOf(status.toUpperCase()) : null;
    }
    
    public Order.ShippingStatus getOrderShippingStatus() {
        return shippingStatus != null ? Order.ShippingStatus.valueOf(shippingStatus.toUpperCase()) : null;
    }
}
