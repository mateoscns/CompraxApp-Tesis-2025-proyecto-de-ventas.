package com.CompraXApp.controller;

import com.CompraXApp.dto.ProductCreateRequest;
import com.CompraXApp.dto.ProductResponse;
import com.CompraXApp.model.Product;
import com.CompraXApp.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    @GetMapping
    public ResponseEntity<List<ProductResponse>> getAllProducts(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice) {
        
        System.out.println("=== CONTROLLER DEBUG ===");
        System.out.println("Received keyword: " + keyword);
        System.out.println("Received minPrice: " + minPrice);
        System.out.println("Received maxPrice: " + maxPrice);
        
        List<Product> products;
        if (keyword != null || minPrice != null || maxPrice != null) {
            products = productService.searchProducts(keyword, minPrice, maxPrice);
        } else {
            products = productService.getAllActiveProducts();
        }
        
        List<ProductResponse> productResponses = products.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
        
        System.out.println("Returning " + productResponses.size() + " products");
        
        return ResponseEntity.ok(productResponses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProductById(@PathVariable Long id) {
        Product product = productService.getProductById(id);
        return ResponseEntity.ok(convertToResponse(product));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductResponse> createProduct(@Valid @RequestBody ProductCreateRequest productRequest) {
        try {
            // Convertir DTO a entidad (SIN ID)
            Product product = new Product();
            product.setName(productRequest.getName());
            product.setDescription(productRequest.getDescription());
            product.setPrice(productRequest.getPrice());
            product.setStockQuantity(productRequest.getStockQuantity());
            product.setImageUrl(productRequest.getImageUrl());
            product.setActive(productRequest.getActive());
            
            Product savedProduct = productService.createProduct(product);
            
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(convertToResponse(savedProduct));
            
        } catch (Exception e) {
            throw new RuntimeException("Error al crear producto: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductResponse> updateProduct(@PathVariable Long id, 
                                                        @Valid @RequestBody ProductCreateRequest productRequest) {
        try {
            // Convertir DTO a entidad para actualización
            Product productDetails = new Product();
            productDetails.setName(productRequest.getName());
            productDetails.setDescription(productRequest.getDescription());
            productDetails.setPrice(productRequest.getPrice());
            productDetails.setStockQuantity(productRequest.getStockQuantity());
            productDetails.setImageUrl(productRequest.getImageUrl());
            productDetails.setActive(productRequest.getActive());
            
            Product updatedProduct = productService.updateProduct(id, productDetails);
            return ResponseEntity.ok(convertToResponse(updatedProduct));
            
        } catch (Exception e) {
            throw new RuntimeException("Error al actualizar producto: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }
    
    // Método helper para convertir entidad a DTO de respuesta
    private ProductResponse convertToResponse(Product product) {
        return new ProductResponse(
            product.getId(),
            product.getName(),
            product.getDescription(),
            product.getPrice(),
            product.getStockQuantity(),
            product.getImageUrl(),
            product.isActive() 
            
        );
    }
}