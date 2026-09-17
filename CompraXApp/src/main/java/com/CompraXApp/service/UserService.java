package com.CompraXApp.service;

import com.CompraXApp.dto.OrderDTO;
import com.CompraXApp.dto.PasswordResetRequest;
import com.CompraXApp.dto.SignupRequest;
import com.CompraXApp.dto.UserProfileResponse;
import com.CompraXApp.dto.UserUpdateRequest;
import com.CompraXApp.exception.ResourceNotFoundException;
import com.CompraXApp.exception.EmailAlreadyExistsException;
import com.CompraXApp.model.Role;
import com.CompraXApp.model.User;
import com.CompraXApp.repository.RoleRepository;
import com.CompraXApp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.UUID;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@SuppressWarnings("null")
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder encoder;

    @Autowired
    private EmailService emailService;

    @Autowired
    private OrderService orderService;

    @Value("${app.frontend.baseurl}")
    private String frontendBaseUrl;

    @Value("${app.frontend.resetpassword.path}")
    private String resetPasswordPath;

    public User registerUser(SignupRequest signUpRequest) throws EmailAlreadyExistsException {
        
        if (userRepository.findByEmail(signUpRequest.getEmail()).isPresent()) {
            throw new EmailAlreadyExistsException("El email " + signUpRequest.getEmail() + " ya está registrado.");
        }

       
        User user = new User();
        user.setName(signUpRequest.getName());
        user.setEmail(signUpRequest.getEmail());
        user.setPassword(encoder.encode(signUpRequest.getPassword()));
        user.setEnabled(false); // Inicialmente deshabilitado hasta verificación
        String verificationCode = UUID.randomUUID().toString().substring(0, 6).toUpperCase(); // Código de 6 caracteres
        user.setVerificationCode(verificationCode);
        user.setVerificationCodeExpiryDate(LocalDateTime.now().plusMinutes(15)); // Cambiado de plusHours(24) a plusMinutes(15)

        Set<Role> roles = new HashSet<>();
        Role userRole = roleRepository.findByName(Role.ERole.ROLE_USER)
                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
        roles.add(userRole);
        user.setRoles(roles);

        User savedUser = userRepository.save(user);

        // Enviar email de verificación
        try {
            emailService.sendVerificationEmail(savedUser.getEmail(), verificationCode);
        } catch (Exception e) {
            // Manejar error de envío de email (loguear, etc.)
            // Podrías considerar si el registro debe fallar aquí o si el usuario puede verificar más tarde
            System.err.println("Error enviando email de verificación a " + savedUser.getEmail() + ": " + e.getMessage());
        }

        return savedUser; // Devuelves el usuario, el controlador decidirá la respuesta HTTP
    }

    public boolean verifyUser(String email, String code) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (!user.isEnabled() && user.getVerificationCode() != null &&
                user.getVerificationCode().equals(code) &&
                user.getVerificationCodeExpiryDate().isAfter(LocalDateTime.now())) {
                
                user.setEnabled(true);
                user.setVerificationCode(null); 
                user.setVerificationCodeExpiryDate(null);
                userRepository.save(user); 
                return true;
            }
        }
        return false;
    }

    public User updateUser(Long userId, UserUpdateRequest updateRequest) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        user.setName(updateRequest.getName());

        if (!user.getEmail().equals(updateRequest.getEmail()) &&
                userRepository.existsByEmail(updateRequest.getEmail())) {
            throw new RuntimeException("Email ya está en uso");
        }
        user.setEmail(updateRequest.getEmail());
        user.setShippingAddress(updateRequest.getShippingAddress());

        return userRepository.save(user);
    }

    /**
     * Verifica si un usuario es el último administrador del sistema
     */
    public boolean isLastAdmin(Long userId) {
        // Contar total de administradores activos
        long adminCount = userRepository.countByRolesNameAndActiveTrue(Role.ERole.ROLE_ADMIN);
        
        // Verificar si el usuario actual es admin
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        boolean isAdmin = user.getRoles().stream()
                .anyMatch(role -> role.getName() == Role.ERole.ROLE_ADMIN);
        
        // Es el último admin si: es admin Y solo hay 1 admin en total
        return isAdmin && adminCount == 1;
    }

    /**
     * Eliminar usuario con validaciones de seguridad
     */
    @Transactional
    public void deleteUser(Long userId) {
        // Validar que no sea el último administrador
        if (isLastAdmin(userId)) {
            throw new RuntimeException("Cannot delete the last administrator account. Please assign admin role to another user first.");
        }
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        // Soft delete - marcar como inactivo en lugar de eliminar
        user.setActive(false);
        userRepository.save(user);
    }

    /**
     * Activar/Desactivar usuario (toggle status)
     */
    @Transactional
    public User toggleUserStatus(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        // Si está activo y es admin, verificar que no sea el último
        if (user.isActive() && isLastAdmin(userId)) {
            throw new RuntimeException("Cannot deactivate the last administrator account.");
        }
        
        user.setActive(!user.isActive());
        return userRepository.save(user);
    }

    /**
     * Actualizar roles con validaciones de seguridad - MÉTODO ÚNICO
     */
    @Transactional
    public void updateUserRoles(Long userId, Set<Role.ERole> newRoles) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        // Verificar si se está intentando quitar el rol ADMIN
        boolean currentlyAdmin = user.getRoles().stream()
                .anyMatch(role -> role.getName() == Role.ERole.ROLE_ADMIN);
        
        boolean willBeAdmin = newRoles.contains(Role.ERole.ROLE_ADMIN);
        
        // Si es admin actualmente y NO será admin después
        if (currentlyAdmin && !willBeAdmin) {
            // Validar que no sea el último administrador
            if (isLastAdmin(userId)) {
                throw new RuntimeException("Cannot remove admin role from the last administrator. Please assign admin role to another user first.");
            }
        }
        
        // Convertir ERole a Role entities
        Set<Role> roles = new HashSet<>();
        for (Role.ERole roleName : newRoles) {
            Role role = roleRepository.findByName(roleName)
                    .orElseThrow(() -> new RuntimeException("Error: Role " + roleName + " is not found."));
            roles.add(role);
        }
        
        user.setRoles(roles);
        userRepository.save(user);
    }

    public void initiatePasswordReset(PasswordResetRequest resetRequest) {
        User user = userRepository.findByEmail(resetRequest.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con email: " + resetRequest.getEmail()));

        // Generar código de 6 dígitos en lugar de token UUID
        String resetCode = String.format("%06d", new java.util.Random().nextInt(999999));
        user.setPasswordResetToken(resetCode);
        user.setPasswordResetTokenExpiry(LocalDateTime.now().plusMinutes(15)); // 15 minutos
        userRepository.save(user);

        emailService.sendPasswordResetEmail(
                user.getEmail(),
                "Código de recuperación de contraseña - CompraXApp",
                "Tu código de recuperación es: " + resetCode + "\n\nEste código expira en 15 minutos."
        );
    }

    public void resetPasswordWithCode(String email, String code, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (user.getPasswordResetToken() == null || !user.getPasswordResetToken().equals(code)) {
            throw new RuntimeException("Código inválido");
        }

        if (!user.isPasswordResetTokenValid()) {
            throw new RuntimeException("El código ha expirado");
        }

        user.setPassword(encoder.encode(newPassword));
        user.setPasswordResetToken(null);
        user.setPasswordResetTokenExpiry(null);
        userRepository.save(user);
    }

    public User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // ELIMINADO: método duplicado updateUserRoles

    public UserProfileResponse getUserProfile(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id " + id));

        UserProfileResponse profileResponse = new UserProfileResponse();
        profileResponse.setId(user.getId());
        profileResponse.setName(user.getName());
        profileResponse.setEmail(user.getEmail());
        profileResponse.setShippingAddress(user.getShippingAddress());

        List<String> roles = user.getRoles().stream()
                .map(role -> role.getName().name())
                .collect(Collectors.toList());

        profileResponse.setRoles(roles);

        List<OrderDTO> purchaseHistory = orderService.getUserPurchaseHistory(id);
        profileResponse.setPurchaseHistory(purchaseHistory);

        return profileResponse;
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
    }

    public Optional<User> findByUsername(String username) {
        return userRepository.findByEmail(username); // Asumiendo que email es el username
    }
}