package com.CompraXApp.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Enumerated(EnumType.STRING)
    private NotificationType type;

    private String title;
    private String message;
    
    @Column(name = "[read]")  // ✅ Mapear explícitamente con corchetes
    private boolean read = false;
    
    private LocalDateTime createdAt = LocalDateTime.now();

    // Para notificaciones relacionadas con órdenes
    private Long relatedOrderId;

    public enum NotificationType {
        ORDER_CREATED,
        PAYMENT_CONFIRMED,
        ORDER_SHIPPED,
        ORDER_DELIVERED,
        PROMOTION,
        STOCK_ALERT,
        GENERAL
    }

    public Notification(User user, NotificationType type, String title, String message) {
        this.user = user;
        this.type = type;
        this.title = title;
        this.message = message;
    }

    public Notification(User user, NotificationType type, String title, String message, Long relatedOrderId) {
        this(user, type, title, message);
        this.relatedOrderId = relatedOrderId;
    }
}
