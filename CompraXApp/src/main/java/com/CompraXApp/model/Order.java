package com.CompraXApp.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private LocalDateTime orderDate = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    private OrderStatus status = OrderStatus.PENDING;

    private BigDecimal totalAmount;

    private String shippingAddress;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();

    public enum OrderStatus {
        PENDING, PROCESSING, COMPLETED, CANCELLED
    }

    public enum ShippingStatus {
        PENDING, PREPARING, SHIPPED, IN_TRANSIT, DELIVERED, CANCELLED
    }

    @Enumerated(EnumType.STRING)
    private ShippingStatus shippingStatus = ShippingStatus.PENDING;

    private String trackingNumber;
    private LocalDateTime shippingDate;
    private LocalDateTime deliveryDate;


    public void addItem(OrderItem item) {
        items.add(item);
        item.setOrder(this);
        updateTotal();
    }


    public void removeItem(OrderItem item) {
        items.remove(item);
        item.setOrder(null);
        updateTotal();
    }


    private void updateTotal() {
        this.totalAmount = items.stream()
                .map(item -> item.getPrice().multiply(new BigDecimal(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}