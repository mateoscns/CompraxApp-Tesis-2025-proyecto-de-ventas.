package com.CompraXApp.controller;

import com.CompraXApp.dto.LoginRequest;
import com.CompraXApp.dto.PasswordResetRequest;
import com.CompraXApp.dto.SignupRequest;
import com.CompraXApp.service.UserService;
import com.CompraXApp.model.User;
import com.CompraXApp.dto.VerificationRequest;
import com.CompraXApp.dto.MessageResponse; 
import com.CompraXApp.exception.EmailAlreadyExistsException; 
import com.CompraXApp.repository.RoleRepository;
import com.CompraXApp.repository.UserRepository;
import com.CompraXApp.security.UserDetailsImpl; // ← CAMBIAR ESTO

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    RoleRepository roleRepository;

    @Autowired
    PasswordEncoder passwordEncoder;

    @Autowired
    UserService userService;

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest, HttpServletRequest request) {
        try {
            System.out.println("=== LOGIN DEBUG ===");
            System.out.println("Email: " + loginRequest.getEmail());
            System.out.println("Password: " + loginRequest.getPassword());
            
            // Verificar que el usuario existe
            Optional<User> userOpt = userRepository.findByEmail(loginRequest.getEmail());
            if (!userOpt.isPresent()) {
                System.out.println("❌ Usuario no encontrado: " + loginRequest.getEmail());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new MessageResponse("Usuario no encontrado"));
            }
            
            User user = userOpt.get();
            System.out.println("✅ Usuario encontrado: " + user.getName());
            
            // ✅ NUEVO: Verificar que el usuario esté activo
            if (!user.isActive()) {
                System.out.println("❌ Usuario desactivado: " + user.getEmail());
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new MessageResponse("Tu cuenta ha sido desactivada. Contacta al administrador."));
            }
            
            // Autenticar usando Spring Security con SESIONES
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword())
            );
            
            // Establecer la autenticación en el contexto de seguridad
            SecurityContextHolder.getContext().setAuthentication(authentication);
            
            // Crear sesión HTTP
            HttpSession session = request.getSession(true);
            session.setAttribute("SPRING_SECURITY_CONTEXT", SecurityContextHolder.getContext());
            
            System.out.println("✅ Login exitoso, sesión creada: " + session.getId());
            
            // Obtener roles del usuario - CORREGIDO
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            List<String> roles = userDetails.getAuthorities().stream()
                    .map(authority -> authority.getAuthority())
                    .collect(Collectors.toList());
            
            // Respuesta simple sin JWT
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Login exitoso");
            response.put("email", user.getEmail());
            response.put("name", user.getName());
            response.put("roles", roles);
            response.put("sessionId", session.getId());
            
            return ResponseEntity.ok(response);
            
        } catch (BadCredentialsException e) {
            System.out.println("❌ Credenciales incorrectas");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new MessageResponse("Email o contraseña incorrectos"));
        } catch (Exception e) {
            System.err.println("❌ Error en login: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error interno del servidor"));
        }
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        try {
            userService.registerUser(signUpRequest);
            return ResponseEntity.status(HttpStatus.CREATED) 
                    .body(new MessageResponse("Usuario registrado exitosamente. Por favor, verifica tu email con el código enviado."));
        } catch (EmailAlreadyExistsException e) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT) 
                    .body(new MessageResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(new MessageResponse("Error durante el registro: " + e.getMessage()));
        }
    }

    @PostMapping("/verify-account")
    public ResponseEntity<?> verifyAccount(@Valid @RequestBody VerificationRequest verificationRequest) {
        boolean isVerified = userService.verifyUser(verificationRequest.getEmail(), verificationRequest.getCode());
        if (isVerified) {
            return ResponseEntity.ok(new MessageResponse("Cuenta verificada exitosamente. Ahora puedes iniciar sesión."));
        } else {
            return ResponseEntity.badRequest().body(new MessageResponse("Código de verificación inválido o expirado."));
        }
    }

    @PostMapping("/password-reset-request")
    public ResponseEntity<?> requestPasswordReset(@Valid @RequestBody PasswordResetRequest request) {
        try {
            userService.initiatePasswordReset(request);
            return ResponseEntity.ok(Map.of("message", "Si el email existe, recibirás un código de 6 dígitos"));
        } catch (Exception e) {
            // No revelar si el email existe o no por seguridad
            return ResponseEntity.ok(Map.of("message", "Si el email existe, recibirás un código de 6 dígitos"));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String code = request.get("code");
            String newPassword = request.get("newPassword");
            
            userService.resetPasswordWithCode(email, code, newPassword);
            return ResponseEntity.ok(Map.of("message", "Contraseña actualizada correctamente"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request, HttpServletResponse response) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null) {
            new SecurityContextLogoutHandler().logout(request, response, auth);
        }
        return ResponseEntity.ok(Map.of("message", "Logout successful"));
    }
}