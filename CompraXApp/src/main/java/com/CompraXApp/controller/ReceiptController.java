package com.CompraXApp.controller;

import com.CompraXApp.security.UserDetailsImpl;
import com.CompraXApp.service.ReceiptService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/receipts")
public class ReceiptController {

    @Autowired
    private ReceiptService receiptService;

    @GetMapping("/{orderId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> getReceipt(@PathVariable Long orderId,
                                       @AuthenticationPrincipal UserDetailsImpl currentUser) {
        try {
            String receipt = receiptService.generateReceipt(orderId);
            return ResponseEntity.ok(Map.of("receipt", receipt));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }
}
