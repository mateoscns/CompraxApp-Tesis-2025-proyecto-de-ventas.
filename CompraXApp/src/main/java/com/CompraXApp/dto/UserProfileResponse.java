package com.CompraXApp.dto;

import lombok.Data;

import java.util.List;

@Data
public class UserProfileResponse {
    private Long id;
    private String name;
    private String email;
    private String shippingAddress;
    private List<String> roles;
    private List<OrderDTO> purchaseHistory;
}