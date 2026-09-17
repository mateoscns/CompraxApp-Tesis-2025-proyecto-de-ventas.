package com.CompraXApp.controller;

import com.CompraXApp.dto.ProductSalesDTO;
import com.CompraXApp.dto.SalesReportDTO;
import com.CompraXApp.dto.UserPurchaseStatisticsDTO;
import com.CompraXApp.service.ReportingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin") // ✅ CORREGIDO: Cambié de "/api/admin/reports" a "/api/admin"
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private ReportingService reportingService;

    // ✅ CORREGIDO: Ruta sin duplicar "reports"
    @GetMapping("/reports/product-sales")
    public ResponseEntity<List<ProductSalesDTO>> getProductSalesStatistics() {
        List<ProductSalesDTO> stats = reportingService.getProductSalesStatistics();
        return ResponseEntity.ok(stats);
    }    // ✅ SIMPLIFICADO: Reportes básicos que funcionan
    @GetMapping("/reports/sales/period")
    public ResponseEntity<SalesReportDTO> getSalesReportForPeriod(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(defaultValue = "30") int days) {
        
        SalesReportDTO report;
        if (startDate != null && endDate != null) {
            report = reportingService.getSalesReportForPeriod(startDate, endDate);
        } else {
            report = reportingService.getSalesReportForLastDays(days);
        }
        return ResponseEntity.ok(report);
    }

    @GetMapping("/reports/users/statistics")
    public ResponseEntity<List<UserPurchaseStatisticsDTO>> getUserPurchaseStatistics(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        
        List<UserPurchaseStatisticsDTO> statistics;
        if (startDate != null && endDate != null) {
            statistics = reportingService.getUserPurchaseStatisticsByPeriod(startDate, endDate);
        } else {
            statistics = reportingService.getUserPurchaseStatistics();
        }
        return ResponseEntity.ok(statistics);
    }    @GetMapping("/reports/summary")
    public ResponseEntity<Map<String, Object>> getReportsSummary() {
        Map<String, Object> summary = new HashMap<>();
        
        // Estadísticas generales
        summary.put("productSales", reportingService.getProductSalesStatistics());
        summary.put("userStatistics", reportingService.getUserPurchaseStatistics());
        summary.put("salesReport", reportingService.getSalesReportForLastDays(30));
        
        return ResponseEntity.ok(summary);
    }
}
