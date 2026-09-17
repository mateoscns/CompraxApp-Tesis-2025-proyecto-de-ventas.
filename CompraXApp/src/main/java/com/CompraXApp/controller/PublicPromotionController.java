package com.CompraXApp.controller;

import com.CompraXApp.dto.PromotionDTO;
import com.CompraXApp.service.PromotionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/promotions")
public class PublicPromotionController {

    @Autowired
    private PromotionService promotionService;

    // ✅ Endpoint público para promociones activas
    @GetMapping("/active")
    public ResponseEntity<List<PromotionDTO>> getActivePromotions() {
        List<PromotionDTO> activePromotions = promotionService.getActivePromotions();
        return ResponseEntity.ok(activePromotions);
    }
}