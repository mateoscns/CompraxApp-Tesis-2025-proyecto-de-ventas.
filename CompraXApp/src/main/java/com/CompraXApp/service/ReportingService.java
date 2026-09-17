package com.CompraXApp.service;

import com.CompraXApp.dto.ProductSalesDTO;
import com.CompraXApp.dto.SalesReportDTO;
import com.CompraXApp.dto.UserPurchaseStatisticsDTO;
import com.CompraXApp.repository.OrderItemRepository;
import com.CompraXApp.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ReportingService {

    @Autowired
    private OrderItemRepository orderItemRepository;
    
    @Autowired
    private OrderRepository orderRepository;

    // ✅ Método existente - Estadísticas de productos más vendidos
    public List<ProductSalesDTO> getProductSalesStatistics() {
        return orderItemRepository.getProductSalesStatistics();
    }

    // ✅ SIMPLIFICADO: Reportes básicos que funcionan
    public SalesReportDTO getSalesReportForPeriod(LocalDateTime startDate, LocalDateTime endDate) {
        Long totalOrders = orderRepository.getTotalOrdersBetween(startDate, endDate);
        BigDecimal totalRevenue = orderRepository.getTotalSalesBetween(startDate, endDate);
        
        String period = startDate.toLocalDate() + " - " + endDate.toLocalDate();
        
        return new SalesReportDTO(period, totalOrders, totalRevenue, startDate, endDate);
    }

    // ✅ Estadísticas de compras por usuario
    public List<UserPurchaseStatisticsDTO> getUserPurchaseStatistics() {
        return orderRepository.getUserPurchaseStatistics();
    }

    public List<UserPurchaseStatisticsDTO> getUserPurchaseStatisticsByPeriod(LocalDateTime startDate, 
                                                                            LocalDateTime endDate) {
        return orderRepository.getUserPurchaseStatisticsByPeriod(startDate, endDate);
    }

    // Métodos de conveniencia
    public SalesReportDTO getSalesReportForLastMonths(int months) {
        LocalDateTime endDate = LocalDateTime.now();
        LocalDateTime startDate = endDate.minusMonths(months);
        return getSalesReportForPeriod(startDate, endDate);
    }

    public SalesReportDTO getSalesReportForLastDays(int days) {
        LocalDateTime endDate = LocalDateTime.now();
        LocalDateTime startDate = endDate.minusDays(days);
        return getSalesReportForPeriod(startDate, endDate);
    }
}
