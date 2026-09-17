package com.CompraXApp.service;

import com.CompraXApp.dto.OrderDTO;
import com.CompraXApp.dto.OrderItemDTO;
import com.CompraXApp.exception.ResourceNotFoundException;
import com.CompraXApp.model.*;
import com.CompraXApp.repository.CartRepository;
import com.CompraXApp.repository.OrderRepository;
import com.CompraXApp.repository.ProductRepository;
import com.CompraXApp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@SuppressWarnings("null")
public class OrderService {
    
    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private ProductRepository productRepository; 

    @Autowired
    private NotificationService notificationService; // ✅ AGREGAR ESTA LÍNEA

  
    @Transactional(readOnly = true)
    public List<OrderDTO> getUserPurchaseHistory(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        return orderRepository.findByUserOrderByOrderDateDesc(user)
                .stream()
                .map(this::convertToOrderDTO)
                .collect(Collectors.toList());
    }

  
    @Transactional
    public OrderDTO createOrderFromCart(Long userId, String shippingAddress) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found for user id: " + userId + ". Cannot create order."));

        if (cart.getItems().isEmpty()) {
            throw new RuntimeException("Cannot create order with an empty cart.");
        }

        Order order = new Order();
        order.setUser(user);
        order.setShippingAddress(shippingAddress); 
        order.setStatus(Order.OrderStatus.PENDING);

        for (CartItem cartItem : cart.getItems()) {
            Product product = productRepository.findById(cartItem.getProduct().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product in cart not found: " + cartItem.getProduct().getName()));
            
            if (product.getStockQuantity() < cartItem.getQuantity()) {
                throw new RuntimeException("Insufficient stock for product: " + product.getName());
            }
            product.setStockQuantity(product.getStockQuantity() - cartItem.getQuantity());
            productRepository.save(product);

            OrderItem orderItem = new OrderItem(product, cartItem.getQuantity());
            order.addItem(orderItem); 
        }
        
        Order savedOrder = orderRepository.save(order);
        
        // ✅ AGREGAR: Crear notificación de pedido creado
        notificationService.createOrderNotification(savedOrder);
        
        cart.clear();
        cartRepository.save(cart);
        
        return convertToOrderDTO(savedOrder);
    }

  
    @Transactional
    public void cancelOrderAsAdmin(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
        
      
        if (order.getStatus() == Order.OrderStatus.COMPLETED) {
            throw new RuntimeException("Cannot cancel a completed order.");
        }
         if (order.getStatus() == Order.OrderStatus.CANCELLED) {
            throw new RuntimeException("Order is already cancelled.");
        }

       
        for (OrderItem item : order.getItems()) {
            Product product = item.getProduct();
            if (product != null) {
                product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
                productRepository.save(product);
            }
        }
        order.setStatus(Order.OrderStatus.CANCELLED);
        orderRepository.save(order);
    }

    // ✅ NUEVO: Cancelar orden como usuario (solo sus propias órdenes)
    @Transactional
    public void cancelOrderAsUser(Long orderId, Long userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
        
        // Verificar que la orden pertenece al usuario
        if (!order.getUser().getId().equals(userId)) {
            throw new RuntimeException("You can only cancel your own orders.");
        }
        
        // Solo se pueden cancelar órdenes PENDING
        if (order.getStatus() != Order.OrderStatus.PENDING) {
            throw new RuntimeException("Only pending orders can be cancelled. Current status: " + order.getStatus());
        }

        // Restaurar stock
        for (OrderItem item : order.getItems()) {
            Product product = item.getProduct();
            if (product != null) {
                product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
                productRepository.save(product);
            }
        }
        order.setStatus(Order.OrderStatus.CANCELLED);
        orderRepository.save(order);
    }

    @Transactional(readOnly = true)
    public List<OrderDTO> getAllOrdersForAdmin() {
        return orderRepository.findAll().stream()
                .map(this::convertToOrderDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OrderDTO getOrderByIdForAdmin(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
        return convertToOrderDTO(order);
    }

    @Transactional(readOnly = true)
    public OrderDTO getOrderByIdForUser(Long orderId, Long userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
    
        // Verificar que la orden pertenece al usuario
        if (!order.getUser().getId().equals(userId)) {
            throw new RuntimeException("Access denied: Order does not belong to user");
        }
    
        return convertToOrderDTO(order);
    }

    /**
     * NUEVO: Actualizar estado de orden (solo para admin)
     */
    @Transactional
    public OrderDTO updateOrderStatus(Long orderId, Order.OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
        
        // Validaciones de negocio
        if (order.getStatus() == Order.OrderStatus.CANCELLED) {
            throw new RuntimeException("Cannot update status of a cancelled order");
        }
        
        if (order.getStatus() == Order.OrderStatus.COMPLETED && newStatus != Order.OrderStatus.COMPLETED) {
            throw new RuntimeException("Cannot change status of a completed order");
        }
        
        // Actualizar estado
        order.setStatus(newStatus);
        Order savedOrder = orderRepository.save(order);
        
        return convertToOrderDTO(savedOrder);
    }

    /**
     * NUEVO: Actualizar estado de envío (solo para admin)
     */
    @Transactional
    public OrderDTO updateShippingStatus(Long orderId, Order.ShippingStatus newShippingStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
        
        order.setShippingStatus(newShippingStatus);
        
        // Si se marca como enviado, generar número de tracking
        if (newShippingStatus == Order.ShippingStatus.SHIPPED && order.getTrackingNumber() == null) {
            order.setTrackingNumber("CX" + System.currentTimeMillis());
            order.setShippingDate(java.time.LocalDateTime.now());
        }
        
        Order savedOrder = orderRepository.save(order);
        
        // ✅ CORREGIR: Agregar todos los casos del enum
        switch (newShippingStatus) {
            case PENDING:
                // No se requiere notificación para pendiente
                break;
            case PREPARING:
                // Opcional: crear notificación de preparación
                break;
            case IN_TRANSIT:
            case SHIPPED:
                notificationService.createShippingNotification(savedOrder);
                break;
            case DELIVERED:
                notificationService.createDeliveryNotification(savedOrder);
                break;
            case CANCELLED:
                // Opcional: crear notificación de cancelación de envío
                break;
            default:
                // Caso por defecto para cualquier nuevo estado
                break;
        }
        
        return convertToOrderDTO(savedOrder);
    }

    private OrderDTO convertToOrderDTO(Order order) {
        OrderDTO orderDTO = new OrderDTO();
        orderDTO.setId(order.getId());
        orderDTO.setOrderDate(order.getOrderDate());
        orderDTO.setStatus(order.getStatus());
        orderDTO.setTotalAmount(order.getTotalAmount());
        orderDTO.setShippingAddress(order.getShippingAddress());
        orderDTO.setUserId(order.getUser().getId()); 
        orderDTO.setUserName(order.getUser().getName()); 

        List<OrderItemDTO> items = order.getItems().stream()
                .map(this::convertToOrderItemDTO)
                .collect(Collectors.toList());

        orderDTO.setItems(items);
        return orderDTO;
    }

    private OrderItemDTO convertToOrderItemDTO(OrderItem item) {
        OrderItemDTO itemDTO = new OrderItemDTO();
        itemDTO.setId(item.getId());
        itemDTO.setProductId(item.getProduct() != null ? item.getProduct().getId() : null);
        itemDTO.setProductName(item.getProductName());
        itemDTO.setPrice(item.getPrice());
        itemDTO.setQuantity(item.getQuantity());
        itemDTO.setSubtotal(item.getPrice().multiply(new BigDecimal(item.getQuantity())));
        return itemDTO;
    }
}