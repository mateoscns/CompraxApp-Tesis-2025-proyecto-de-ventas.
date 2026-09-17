package com.CompraXApp.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "users",
       uniqueConstraints = {
           @UniqueConstraint(columnNames = "email")
       })
@Data
@NoArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 50)
    @Column(nullable = false)
    private String name;

    @NotBlank
    @Size(max = 50)
    @Email
    @Column(nullable = false, unique = true)
    private String email;

    @NotBlank
    @Size(max = 120)
    @Column(nullable = false)
    private String password;

    private String shippingAddress;

    private boolean active = true; // Maps to 'active' column in DB

    private LocalDateTime createdAt = LocalDateTime.now();

    private String passwordResetToken;

    private LocalDateTime passwordResetTokenExpiry;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "user_roles",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<Role> roles = new HashSet<>();

    // NUEVOS CAMPOS PARA VERIFICACIÓN DE EMAIL
    private boolean enabled = false; // This field is causing the error

    @Column(name = "verification_code")
    private String verificationCode;

    @Column(name = "verification_code_expiry_date")
    private LocalDateTime verificationCodeExpiryDate;

    public void generatePasswordResetToken() {
        this.passwordResetToken = UUID.randomUUID().toString();
        this.passwordResetTokenExpiry = LocalDateTime.now().plusHours(1);
    }

    public boolean isPasswordResetTokenValid() {
        return this.passwordResetTokenExpiry != null &&
                LocalDateTime.now().isBefore(this.passwordResetTokenExpiry);
    }
}