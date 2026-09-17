package com.CompraXApp.controller;

import com.CompraXApp.dto.CreateOrderRequest;
import com.CompraXApp.dto.OrderDTO;
import com.CompraXApp.model.Order;
import com.CompraXApp.security.UserDetailsImpl;
import com.CompraXApp.service.OrderService;
import com.CompraXApp.service.WhatsAppService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private WhatsAppService whatsAppService;

    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<OrderDTO> createOrder(@AuthenticationPrincipal UserDetailsImpl currentUser,
                                                @Valid @RequestBody CreateOrderRequest request) {
        try {
            OrderDTO createdOrder = orderService.createOrderFromCart(currentUser.getId(), request.getShippingAddress());
            return new ResponseEntity<>(createdOrder, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            // Manejo de errores específicos
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/my-orders")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<OrderDTO>> getCurrentUserOrders(@AuthenticationPrincipal UserDetailsImpl currentUser) {
        List<OrderDTO> orders = orderService.getUserPurchaseHistory(currentUser.getId());
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<OrderDTO>> getUserOrdersForAdmin(@PathVariable Long userId) {
        List<OrderDTO> orders = orderService.getUserPurchaseHistory(userId);
        return ResponseEntity.ok(orders);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<OrderDTO>> getAllOrdersForAdmin() {
        List<OrderDTO> orders = orderService.getAllOrdersForAdmin();
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{orderId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OrderDTO> getOrderByIdForAdmin(@PathVariable Long orderId) {
        OrderDTO order = orderService.getOrderByIdForAdmin(orderId);
        return ResponseEntity.ok(order);
    }

    // ✅ ADMIN puede cancelar cualquier orden
    @PatchMapping("/{orderId}/cancel")
    @PreAuthorize("hasRole('ADMIN') or hasRole('USER')")
    public ResponseEntity<?> cancelOrder(@PathVariable Long orderId,
                                         @AuthenticationPrincipal UserDetailsImpl currentUser) {
        try {
            // Si es USER, verificar que sea su propia orden
            if (currentUser.getAuthorities().stream()
                    .noneMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
                orderService.cancelOrderAsUser(orderId, currentUser.getId());
            } else {
                orderService.cancelOrderAsAdmin(orderId);
            }
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{orderId}/whatsapp-payment")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> requestWhatsAppPayment(@PathVariable Long orderId,
                                                    @AuthenticationPrincipal UserDetailsImpl currentUser) {
        OrderDTO order = orderService.getOrderByIdForUser(orderId, currentUser.getId());
        String whatsappLink = whatsAppService.generateWhatsAppLink(order);

        return ResponseEntity.ok(Map.of("whatsappLink", whatsappLink));
    }


    @GetMapping("/{orderId}/details")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<OrderDTO> getOrderDetailsForUser(@PathVariable Long orderId,
                                                           @AuthenticationPrincipal UserDetailsImpl currentUser) {

        OrderDTO order = orderService.getOrderByIdForUser(orderId, currentUser.getId());
        return ResponseEntity.ok(order);
    }

    /**
     * CORREGIDO: Actualizar estado de orden (recibe JSON en body)
     */
    @PutMapping("/{orderId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long orderId,
                                              @RequestBody Map<String, String> request) {
        try {
            String statusStr = request.get("status");
            if (statusStr == null || statusStr.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Status is required"));
            }

            Order.OrderStatus status = Order.OrderStatus.valueOf(statusStr.toUpperCase());
            OrderDTO updatedOrder = orderService.updateOrderStatus(orderId, status);

            return ResponseEntity.ok(Map.of(
                    "message", "Order status updated successfully",
                    "order", updatedOrder
            ));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Invalid status value: " + request.get("status")));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * ALTERNATIVA: También mantener versión con query parameter
     */
    @PatchMapping("/{orderId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateOrderStatusQuery(@PathVariable Long orderId,
                                                   @RequestParam Order.OrderStatus status) {
        try {
            OrderDTO updatedOrder = orderService.updateOrderStatus(orderId, status);
            return ResponseEntity.ok(Map.of(
                    "message", "Order status updated successfully",
                    "order", updatedOrder
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * CORREGIDO: Actualizar estado de envío (recibe JSON en body)
     */
    @PutMapping("/{orderId}/shipping-status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateShippingStatus(@PathVariable Long orderId,
                                                 @RequestBody Map<String, String> request) {
        try {
            String shippingStatusStr = request.get("shippingStatus");
            if (shippingStatusStr == null || shippingStatusStr.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Shipping status is required"));
            }

            Order.ShippingStatus shippingStatus = Order.ShippingStatus.valueOf(shippingStatusStr.toUpperCase());
            OrderDTO updatedOrder = orderService.updateShippingStatus(orderId, shippingStatus);

            return ResponseEntity.ok(Map.of(
                    "message", "Shipping status updated successfully",
                    "order", updatedOrder
            ));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Invalid shipping status value: " + request.get("shippingStatus")));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * MEJORADO: Endpoint más completo para actualización de orden
     */
    @PutMapping("/{orderId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateOrder(@PathVariable Long orderId,
                                        @RequestBody Map<String, Object> updates) {
        try {
            // Actualizar estado de orden si se proporciona
            if (updates.containsKey("status")) {
                String statusStr = (String) updates.get("status");
                Order.OrderStatus status = Order.OrderStatus.valueOf(statusStr.toUpperCase());
                orderService.updateOrderStatus(orderId, status);
            }

            // Actualizar estado de envío si se proporciona
            if (updates.containsKey("shippingStatus")) {
                String shippingStatusStr = (String) updates.get("shippingStatus");
                Order.ShippingStatus shippingStatus = Order.ShippingStatus.valueOf(shippingStatusStr.toUpperCase());
                orderService.updateShippingStatus(orderId, shippingStatus);
            }

            // Devolver orden actualizada
            OrderDTO updatedOrder = orderService.getOrderByIdForAdmin(orderId);
            return ResponseEntity.ok(updatedOrder);

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

}