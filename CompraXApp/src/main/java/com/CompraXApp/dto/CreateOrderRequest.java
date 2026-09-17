package com.CompraXApp.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateOrderRequest {
    
    @NotBlank(message = "La dirección de envío es requerida")
    @Size(min = 10, max = 500, message = "La dirección debe tener entre 10 y 500 caracteres")
    private String shippingAddress;
    
    // Constructor vacío requerido para Jackson
    public CreateOrderRequest() {}
    
    public CreateOrderRequest(String shippingAddress) {
        this.shippingAddress = shippingAddress;
    }
    
    // Getters y setters (o usar Lombok @Data)
    public String getShippingAddress() {
        return shippingAddress;
    }
    
    public void setShippingAddress(String shippingAddress) {
        this.shippingAddress = shippingAddress;
    }
}
