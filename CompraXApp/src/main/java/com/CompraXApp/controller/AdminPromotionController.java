package com.CompraXApp.controller;

import com.CompraXApp.dto.PromotionCreateRequest;
import com.CompraXApp.dto.PromotionDTO;
import com.CompraXApp.service.PromotionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/promotions")
@PreAuthorize("hasRole('ADMIN')")
public class AdminPromotionController {

    @Autowired
    private PromotionService promotionService;

    // ✅ Crear nueva promoción
    @PostMapping
    public ResponseEntity<PromotionDTO> createPromotion(@Valid @RequestBody PromotionCreateRequest request) {
        try {
            PromotionDTO createdPromotion = promotionService.createPromotion(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdPromotion);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // ✅ Obtener todas las promociones
    @GetMapping
    public ResponseEntity<List<PromotionDTO>> getAllPromotions() {
        List<PromotionDTO> promotions = promotionService.getAllPromotions();
        return ResponseEntity.ok(promotions);
    }




    // ✅ Obtener solo promociones activas
    @GetMapping("/active")
    public ResponseEntity<List<PromotionDTO>> getActivePromotions() {
        List<PromotionDTO> activePromotions = promotionService.getActivePromotions();
        return ResponseEntity.ok(activePromotions);
    }

    // ✅ Obtener promoción por ID
    @GetMapping("/{id}")
    public ResponseEntity<PromotionDTO> getPromotionById(@PathVariable Long id) {
        try {
            PromotionDTO promotion = promotionService.getPromotionById(id);
            return ResponseEntity.ok(promotion);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ✅ Actualizar promoción
    @PutMapping("/{id}")
    public ResponseEntity<PromotionDTO> updatePromotion(@PathVariable Long id,
                                                       @Valid @RequestBody PromotionCreateRequest request) {
        try {
            PromotionDTO updatedPromotion = promotionService.updatePromotion(id, request);
            return ResponseEntity.ok(updatedPromotion);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ✅ Eliminar promoción
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deletePromotion(@PathVariable Long id) {
        try {
            promotionService.deletePromotion(id);
            return ResponseEntity.ok(Map.of("message", "Promoción eliminada exitosamente"));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ✅ Activar/Desactivar promoción
    @PatchMapping("/{id}/toggle")
    public ResponseEntity<PromotionDTO> togglePromotionStatus(@PathVariable Long id) {
        try {
            PromotionDTO promotion = promotionService.togglePromotionStatus(id);
            return ResponseEntity.ok(promotion);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ✅ Enviar promoción específica a todos los usuarios
    @PostMapping("/{id}/send")
    public ResponseEntity<Map<String, String>> sendPromotionToAllUsers(@PathVariable Long id) {
        try {
            PromotionDTO promotion = promotionService.getPromotionById(id);
            promotionService.sendPromotionToAllUsers(
                // Crear objeto Promotion desde DTO (necesitarás este método auxiliar)
                convertToPromotion(promotion)
            );
            return ResponseEntity.ok(Map.of("message", "Promoción enviada a todos los usuarios"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Error al enviar la promoción: " + e.getMessage()));
        }
    }

    // Método auxiliar para convertir DTO a entidad
    private com.CompraXApp.model.Promotion convertToPromotion(PromotionDTO dto) {
        com.CompraXApp.model.Promotion promotion = new com.CompraXApp.model.Promotion();
        promotion.setId(dto.getId());
        promotion.setTitle(dto.getTitle());
        promotion.setDescription(dto.getDescription());
        promotion.setDiscountPercentage(dto.getDiscountPercentage());
        promotion.setStartDate(dto.getStartDate());
        promotion.setEndDate(dto.getEndDate());
        promotion.setActive(dto.isActive());
        return promotion;
    }
}
