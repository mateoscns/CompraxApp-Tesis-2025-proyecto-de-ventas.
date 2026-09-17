package com.CompraXApp.repository;

import com.CompraXApp.dto.ProductSalesDTO; // Add this import
import com.CompraXApp.model.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query; // Add this import
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    List<OrderItem> findByOrderId(Long orderId);

    @Query("SELECT new com.CompraXApp.dto.ProductSalesDTO(oi.product.id, oi.product.name, SUM(oi.quantity), SUM(oi.price * oi.quantity)) " +
           "FROM OrderItem oi WHERE oi.order.status = com.CompraXApp.model.Order.OrderStatus.COMPLETED " +
           "GROUP BY oi.product.id, oi.product.name " +
           "ORDER BY SUM(oi.price * oi.quantity) DESC")
    List<ProductSalesDTO> getProductSalesStatistics();
}