package com.CompraXApp.service;

import com.CompraXApp.dto.PromotionCreateRequest;
import com.CompraXApp.dto.PromotionDTO;
import com.CompraXApp.model.Promotion;
import com.CompraXApp.model.User;
import com.CompraXApp.repository.UserRepository;
import com.CompraXApp.repository.PromotionRepository;
import com.CompraXApp.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@SuppressWarnings("null")
public class PromotionService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PromotionRepository promotionRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private NotificationService notificationService;

    // ✅ AGREGAR: Crear promoción
    @Transactional
    public PromotionDTO createPromotion(PromotionCreateRequest request) {
        // Validar que la fecha de fin sea posterior a la de inicio
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new IllegalArgumentException("La fecha de fin debe ser posterior a la fecha de inicio");
        }
        
        Promotion promotion = new Promotion();
        promotion.setTitle(request.getTitle());
        promotion.setDescription(request.getDescription());
        promotion.setDiscountPercentage(request.getDiscountPercentage());
        promotion.setStartDate(request.getStartDate());
        promotion.setEndDate(request.getEndDate());
        promotion.setActive(request.getActive());
        
        Promotion savedPromotion = promotionRepository.save(promotion);
        
        // Si la promoción está activa y ya comenzó, enviar notificación inmediata
        if (savedPromotion.isActive() && 
            savedPromotion.getStartDate().isBefore(LocalDateTime.now()) &&
            savedPromotion.getEndDate().isAfter(LocalDateTime.now())) {
            sendPromotionToAllUsers(savedPromotion);
        }
        
        return new PromotionDTO(savedPromotion);
    }

    // ✅ AGREGAR: Obtener todas las promociones
    @Transactional(readOnly = true)
    public List<PromotionDTO> getAllPromotions() {
        return promotionRepository.findAll()
                .stream()
                .map(PromotionDTO::new)
                .collect(Collectors.toList());
    }

    // ✅ AGREGAR: Obtener promociones activas
    @Transactional(readOnly = true)
    public List<PromotionDTO> getActivePromotions() {
        return promotionRepository.findByActiveTrue()
                .stream()
                .map(PromotionDTO::new)
                .collect(Collectors.toList());
    }

    // ✅ AGREGAR: Obtener promoción por ID
    @Transactional(readOnly = true)
    public PromotionDTO getPromotionById(Long id) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Promotion not found with id: " + id));
        return new PromotionDTO(promotion);
    }

    // ✅ AGREGAR: Actualizar promoción
    @Transactional
    public PromotionDTO updatePromotion(Long id, PromotionCreateRequest request) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Promotion not found with id: " + id));
        
        // Validar fechas
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new IllegalArgumentException("La fecha de fin debe ser posterior a la fecha de inicio");
        }
        
        promotion.setTitle(request.getTitle());
        promotion.setDescription(request.getDescription());
        promotion.setDiscountPercentage(request.getDiscountPercentage());
        promotion.setStartDate(request.getStartDate());
        promotion.setEndDate(request.getEndDate());
        promotion.setActive(request.getActive());
        
        Promotion savedPromotion = promotionRepository.save(promotion);
        return new PromotionDTO(savedPromotion);
    }

    // ✅ AGREGAR: Eliminar promoción
    @Transactional
    public void deletePromotion(Long id) {
        if (!promotionRepository.existsById(id)) {
            throw new ResourceNotFoundException("Promotion not found with id: " + id);
        }
        promotionRepository.deleteById(id);
    }

    // ✅ AGREGAR: Activar/Desactivar promoción
    @Transactional
    public PromotionDTO togglePromotionStatus(Long id) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Promotion not found with id: " + id));
        
        promotion.setActive(!promotion.isActive());
        Promotion savedPromotion = promotionRepository.save(promotion);
        
        // Si se activó y está vigente, enviar notificación
        if (savedPromotion.isActive() && 
            savedPromotion.getStartDate().isBefore(LocalDateTime.now()) &&
            savedPromotion.getEndDate().isAfter(LocalDateTime.now())) {
            sendPromotionToAllUsers(savedPromotion);
        }
        
        return new PromotionDTO(savedPromotion);
    }

    // ✅ AGREGAR: Enviar promoción específica a todos los usuarios
    @Transactional
    public void sendPromotionToAllUsers(Promotion promotion) {
        List<User> users = userRepository.findByActiveTrue();
        
        for (User user : users) {
            // Email
            emailService.sendPromotionEmail(user.getEmail(), List.of(promotion));
            
            // Notificación en plataforma
            notificationService.createPromotionNotification(
                user, 
                promotion.getTitle(), 
                promotion.getDescription()
            );
        }
    }

    // ✅ MÉTODO EXISTENTE: Envío automático semanal
    @Scheduled(cron = "0 0 9 * * MON") // Cada lunes a las 9 AM
    public void sendWeeklyPromotions() {
        List<User> users = userRepository.findByActiveTrue();
        List<Promotion> activePromotions = promotionRepository.findByActiveTrue();

        if (activePromotions.isEmpty()) {
            return; // No hay promociones activas
        }

        for (User user : users) {
            // Email existente
            emailService.sendPromotionEmail(user.getEmail(), activePromotions);
            
            // Crear notificaciones en plataforma
            for (Promotion promotion : activePromotions) {
                notificationService.createPromotionNotification(
                    user, 
                    promotion.getTitle(), 
                    promotion.getDescription()
                );
            }
        }
    }
}