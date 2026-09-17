package com.CompraXApp.repository;

import com.CompraXApp.dto.UserPurchaseStatisticsDTO;
import com.CompraXApp.model.Order;
import com.CompraXApp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    @Override
    @NonNull
    Optional<Order> findById(@NonNull Long id);

    List<Order> findByUserOrderByOrderDateDesc(User user);


    List<Order> findByUserIdOrderByOrderDateDesc(Long userId);
 
    long countByStatus(Order.OrderStatus status);
    
    @Query("SELECT o FROM Order o WHERE o.status = 'COMPLETED'")
    List<Order> findCompletedOrders();
    
    @Query("SELECT o FROM Order o WHERE o.user.id = :userId AND o.status = 'COMPLETED'")
    List<Order> findCompletedOrdersByUserId(Long userId);    // ✅ SIMPLIFICADO: Reportes básicos que funcionan
    @Query("SELECT COUNT(o) FROM Order o WHERE o.status = 'COMPLETED' AND o.orderDate BETWEEN :startDate AND :endDate")
    Long getTotalOrdersBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.status = 'COMPLETED' AND o.orderDate BETWEEN :startDate AND :endDate")
    BigDecimal getTotalSalesBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);    // ✅ AGREGAR: Estadísticas de compras por usuario (simplificadas)
    @Query("SELECT new com.CompraXApp.dto.UserPurchaseStatisticsDTO(" +
           "u.id, u.name, u.email, COUNT(o), SUM(o.totalAmount)) " +
           "FROM Order o JOIN o.user u " +
           "WHERE o.status = 'COMPLETED' " +
           "GROUP BY u.id, u.name, u.email " +
           "ORDER BY SUM(o.totalAmount) DESC")
    List<UserPurchaseStatisticsDTO> getUserPurchaseStatistics();

    @Query("SELECT new com.CompraXApp.dto.UserPurchaseStatisticsDTO(" +
           "u.id, u.name, u.email, COUNT(o), SUM(o.totalAmount)) " +
           "FROM Order o JOIN o.user u " +
           "WHERE o.status = 'COMPLETED' " +
           "AND o.orderDate BETWEEN :startDate AND :endDate " +
           "GROUP BY u.id, u.name, u.email " +
           "ORDER BY SUM(o.totalAmount) DESC")
    List<UserPurchaseStatisticsDTO> getUserPurchaseStatisticsByPeriod(@Param("startDate") LocalDateTime startDate,
                                                                     @Param("endDate") LocalDateTime endDate);
}