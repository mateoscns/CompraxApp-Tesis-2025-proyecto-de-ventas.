package com.CompraXApp.service;

import com.CompraXApp.exception.ResourceNotFoundException;
import com.CompraXApp.model.Product;
import com.CompraXApp.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@SuppressWarnings("null")
public class ProductService {
    @Autowired
    private ProductRepository productRepository;
    
    public List<Product> getAllActiveProducts() { 
        return productRepository.findByActiveTrue();
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }
    
    public Product getProductById(Long id) {
        return productRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Product not found with id " + id));
    }
    
    public Product createProduct(Product product) {
        return productRepository.save(product);
    }
    
    public Product updateProduct(Long id, Product productDetails) {
        Product product = getProductById(id);
        product.setName(productDetails.getName());
        product.setDescription(productDetails.getDescription());
        product.setPrice(productDetails.getPrice());
        product.setImageUrl(productDetails.getImageUrl());
        product.setStockQuantity(productDetails.getStockQuantity());
        product.setActive(productDetails.isActive());
        return productRepository.save(product);
    }
    
    public void deleteProduct(Long id) {
        Product product = getProductById(id);
        product.setActive(false);
        productRepository.save(product);
    }
    
    public List<Product> searchProducts(String keyword, BigDecimal minPrice, BigDecimal maxPrice) {
        System.out.println("=== SEARCH DEBUG ===");
        System.out.println("Keyword: " + keyword);
        System.out.println("MinPrice: " + minPrice);
        System.out.println("MaxPrice: " + maxPrice);
        
        // Si no hay filtros, devolver todos los productos activos
        if ((keyword == null || keyword.trim().isEmpty()) && minPrice == null && maxPrice == null) {
            return getAllActiveProducts();
        }
        
        // Obtener todos los productos activos
        List<Product> allProducts = getAllActiveProducts();
        
        return allProducts.stream()
                .filter(product -> {
                    boolean matches = true;
                    
                    // Filtro por palabra clave (nombre o descripción)
                    if (keyword != null && !keyword.trim().isEmpty()) {
                        String keywordLower = keyword.toLowerCase();
                        boolean keywordMatch = product.getName().toLowerCase().contains(keywordLower) ||
                                             (product.getDescription() != null && 
                                              product.getDescription().toLowerCase().contains(keywordLower));
                        matches = matches && keywordMatch;
                        System.out.println("Product: " + product.getName() + " - Keyword match: " + keywordMatch);
                    }
                    
                    // Filtro por precio mínimo
                    if (minPrice != null) {
                        boolean minPriceMatch = product.getPrice().compareTo(minPrice) >= 0;
                        matches = matches && minPriceMatch;
                        System.out.println("Product: " + product.getName() + " - MinPrice match: " + minPriceMatch + 
                                         " (Price: " + product.getPrice() + " >= " + minPrice + ")");
                    }
                    
                    // Filtro por precio máximo
                    if (maxPrice != null) {
                        boolean maxPriceMatch = product.getPrice().compareTo(maxPrice) <= 0;
                        matches = matches && maxPriceMatch;
                        System.out.println("Product: " + product.getName() + " - MaxPrice match: " + maxPriceMatch + 
                                         " (Price: " + product.getPrice() + " <= " + maxPrice + ")");
                    }
                    
                    System.out.println("Product: " + product.getName() + " - Final match: " + matches);
                    return matches;
                })
                .collect(Collectors.toList());
    }
}
