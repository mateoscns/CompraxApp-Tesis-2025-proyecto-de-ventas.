package com.CompraXApp.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UserUpdateRequest {
    @NotBlank(message = "El nombre es obligatorio")
    private String name;

    @Email(message = "El formato de email es inválido")
    private String email;

    private String shippingAddress;
}