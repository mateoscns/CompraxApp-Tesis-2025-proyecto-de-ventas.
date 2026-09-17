package com.CompraXApp.controller;

import com.CompraXApp.dto.UserProfileResponse;
import com.CompraXApp.dto.UserUpdateRequest;
import com.CompraXApp.model.Role;
import com.CompraXApp.model.User;
import com.CompraXApp.security.UserDetailsImpl;
import com.CompraXApp.service.OrderService;
import com.CompraXApp.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private OrderService orderService;

    // ✅ CORRECTO: Usuario solo puede ver SUS PROPIOS datos o Admin puede ver cualquiera
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<UserProfileResponse> getUserById(@PathVariable Long id,
                                                          @AuthenticationPrincipal UserDetailsImpl currentUser) {
        // Verificar que el usuario solo puede acceder a sus propios datos (a menos que sea admin)
        if (!currentUser.getAuthorities().stream().anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"))) {
            if (!currentUser.getId().equals(id)) {
                return ResponseEntity.status(403).build(); // Forbidden
            }
        }

        UserProfileResponse profile = userService.getUserProfile(id);
        return ResponseEntity.ok(profile);
    }

    // ✅ MEJOR: Endpoint específico para que el usuario vea SU PROPIO perfil
    @GetMapping("/me")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<UserProfileResponse> getMyProfile(@AuthenticationPrincipal UserDetailsImpl currentUser) {
        UserProfileResponse profile = userService.getUserProfile(currentUser.getId());
        return ResponseEntity.ok(profile);
    }

    // ✅ CORRECTO: Usuario solo puede ver SU PROPIO historial de compras
    @GetMapping("/{id}/purchase-history")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> getUserPurchaseHistory(@PathVariable Long id,
                                                   @AuthenticationPrincipal UserDetailsImpl currentUser) {
        // Verificar que el usuario solo puede acceder a su propio historial
        if (!currentUser.getAuthorities().stream().anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"))) {
            if (!currentUser.getId().equals(id)) {
                return ResponseEntity.status(403).build(); // Forbidden
            }
        }

        return ResponseEntity.ok(orderService.getUserPurchaseHistory(id));
    }

    // ✅ MEJOR: Endpoint específico para que el usuario vea SU PROPIO historial
    @GetMapping("/me/purchase-history")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> getMyPurchaseHistory(@AuthenticationPrincipal UserDetailsImpl currentUser) {
        return ResponseEntity.ok(orderService.getUserPurchaseHistory(currentUser.getId()));
    }

    // ✅ CORRECTO: Usuario solo puede modificar SUS PROPIOS datos
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<User> updateUser(@PathVariable Long id,
                                          @RequestBody UserUpdateRequest updateRequest,
                                          @AuthenticationPrincipal UserDetailsImpl currentUser) {
        // Verificar que el usuario solo puede modificar sus propios datos
        if (!currentUser.getAuthorities().stream().anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"))) {
            if (!currentUser.getId().equals(id)) {
                return ResponseEntity.status(403).build(); // Forbidden
            }
        }

        User updatedUser = userService.updateUser(id, updateRequest);
        return ResponseEntity.ok(updatedUser);
    }

    // ✅ MEJOR: Endpoint específico para que el usuario modifique SU PROPIO perfil
    @PutMapping("/me")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<User> updateMyProfile(@RequestBody UserUpdateRequest updateRequest,
                                               @AuthenticationPrincipal UserDetailsImpl currentUser) {
        User updatedUser = userService.updateUser(currentUser.getId(), updateRequest);
        return ResponseEntity.ok(updatedUser);
    }

    // ✅ MEJORADO: Validar antes de eliminar cuenta propia
    @DeleteMapping("/me")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> deleteMyAccount(@AuthenticationPrincipal UserDetailsImpl currentUser) {
        try {
            userService.deleteUser(currentUser.getId());
            return ResponseEntity.ok(Map.of("message", "Account deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ✅ MEJORADO: Validar antes de eliminar cuenta de otro usuario
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable Long id,
                                       @AuthenticationPrincipal UserDetailsImpl currentUser) {
        // Verificar permisos
        if (!currentUser.getAuthorities().stream().anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"))) {
            if (!currentUser.getId().equals(id)) {
                return ResponseEntity.status(403).build();
            }
        }
        
        try {
            userService.deleteUser(id);
            return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ✅ CORRECTO: Solo ADMIN puede ver todos los usuarios
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    // ✅ NUEVO: Activar/Desactivar usuario (soft delete toggle)
    @PutMapping("/{id}/toggle-status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> toggleUserStatus(@PathVariable Long id,
                                              @AuthenticationPrincipal UserDetailsImpl currentUser) {
        // No permitir desactivarse a sí mismo
        if (currentUser.getId().equals(id)) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Cannot change your own status"));
        }
        
        try {
            User user = userService.toggleUserStatus(id);
            return ResponseEntity.ok(Map.of(
                "message", user.isActive() ? "User activated successfully" : "User deactivated successfully",
                "active", user.isActive()
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ✅ MEJORADO: Validar antes de actualizar roles
    @PutMapping("/{id}/roles")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUserRoles(@PathVariable Long id, @RequestBody Set<Role.ERole> roles) {
        try {
            userService.updateUserRoles(id, roles);
            return ResponseEntity.ok(Map.of("message", "User roles updated successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }
}