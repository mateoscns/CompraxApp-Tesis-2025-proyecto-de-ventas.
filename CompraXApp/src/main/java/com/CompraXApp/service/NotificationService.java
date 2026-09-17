package com.CompraXApp.service;

import com.CompraXApp.dto.NotificationDTO;
import com.CompraXApp.model.Notification;
import com.CompraXApp.model.Order;
import com.CompraXApp.model.User;
import com.CompraXApp.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@SuppressWarnings("null")
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private EmailService emailService;

    // ✅ Crear notificación de pedido creado
    @Transactional
    public void createOrderNotification(Order order) {
        String title = "Pedido creado exitosamente";
        String message = String.format("Tu pedido #%d por $%.2f ha sido registrado correctamente.", 
                order.getId(), order.getTotalAmount());

        Notification notification = new Notification(
                order.getUser(),
                Notification.NotificationType.ORDER_CREATED,
                title,
                message,
                order.getId()
        );

        notificationRepository.save(notification);

        // También enviar por email
        emailService.sendOrderConfirmationEmail(order.getUser().getEmail(), order);
    }

    // ✅ Crear notificación de pago confirmado
    @Transactional
    public void createPaymentConfirmationNotification(Order order) {
        String title = "Pago confirmado";
        String message = String.format("El pago de tu pedido #%d ha sido confirmado. Tu pedido está siendo procesado.", 
                order.getId());

        Notification notification = new Notification(
                order.getUser(),
                Notification.NotificationType.PAYMENT_CONFIRMED,
                title,
                message,
                order.getId()
        );

        notificationRepository.save(notification);
    }

    // ✅ Crear notificación de envío
    @Transactional
    public void createShippingNotification(Order order) {
        String title = "Pedido enviado";
        String message = String.format("Tu pedido #%d ha sido enviado. Número de seguimiento: %s", 
                order.getId(), order.getTrackingNumber());

        Notification notification = new Notification(
                order.getUser(),
                Notification.NotificationType.ORDER_SHIPPED,
                title,
                message,
                order.getId()
        );

        notificationRepository.save(notification);
    }

    // ✅ Crear notificación de entrega
    @Transactional
    public void createDeliveryNotification(Order order) {
        String title = "Pedido entregado";
        String message = String.format("Tu pedido #%d ha sido entregado exitosamente. ¡Gracias por tu compra!", 
                order.getId());

        Notification notification = new Notification(
                order.getUser(),
                Notification.NotificationType.ORDER_DELIVERED,
                title,
                message,
                order.getId()
        );

        notificationRepository.save(notification);
    }

    // ✅ Crear notificación de promoción
    @Transactional
    public void createPromotionNotification(User user, String promotionTitle, String promotionMessage) {
        Notification notification = new Notification(
                user,
                Notification.NotificationType.PROMOTION,
                "Nueva promoción disponible",
                promotionTitle + ": " + promotionMessage
        );

        notificationRepository.save(notification);
    }

    // ✅ Obtener notificaciones del usuario
    @Transactional(readOnly = true)
    public List<NotificationDTO> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(NotificationDTO::new)
                .collect(Collectors.toList());
    }

    // ✅ Obtener notificaciones no leídas
    @Transactional(readOnly = true)
    public List<NotificationDTO> getUnreadNotifications(Long userId) {
        return notificationRepository.findByUserIdAndReadFalseOrderByCreatedAtDesc(userId)
                .stream()
                .map(NotificationDTO::new)
                .collect(Collectors.toList());
    }

    // ✅ Contar notificaciones no leídas
    @Transactional(readOnly = true)
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    // ✅ Marcar notificación como leída
    @Transactional
    public void markAsRead(Long notificationId, Long userId) {
        notificationRepository.findById(notificationId)
                .filter(notification -> notification.getUser().getId().equals(userId))
                .ifPresent(notification -> {
                    notification.setRead(true);
                    notificationRepository.save(notification);
                });
    }

    // ✅ Marcar todas como leídas
    @Transactional
    public void markAllAsRead(Long userId) {
        List<Notification> unreadNotifications = 
                notificationRepository.findByUserIdAndReadFalseOrderByCreatedAtDesc(userId);
        
        unreadNotifications.forEach(notification -> notification.setRead(true));
        notificationRepository.saveAll(unreadNotifications);
    }
}
