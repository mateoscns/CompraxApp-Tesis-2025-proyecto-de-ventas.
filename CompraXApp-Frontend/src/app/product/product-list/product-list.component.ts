import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService, ProductResponse } from '../product.service';
import { CartService } from '../../cart/cart.service';
import { AuthService, LoginResponse } from '../../auth/auth.service';
import { Product } from '../../models/Product';
import { PromotionService, ProductWithPromotion } from '../../services/promotion.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css'
})
export class ProductListComponent implements OnInit {
  products: ProductWithPromotion[] = [];
  allProducts: ProductWithPromotion[] = [];
  isLoading = true;
  currentUser: LoginResponse | null = null;
  viewMode: 'grid' | 'list' = 'grid';
  searchKeyword = '';
  minPrice?: number;
  maxPrice?: number;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private authService: AuthService,
    private router: Router,
    private promotionService: PromotionService,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.loadProducts();
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
    });

    this.promotionService.activePromotions$.subscribe(promotions => {
      if (promotions.length > 0 && this.allProducts.length > 0) {
        this.refreshProductsWithPromotions();
      }
    });
  }

  refreshProductsWithPromotions(): void {
    this.products = this.promotionService.applyPromotionsToProducts(this.allProducts);
    this.filterProducts();
  }

  loadProducts(): void {
    this.isLoading = true;
    
    this.productService.getProducts(this.searchKeyword, this.minPrice, this.maxPrice)
      .subscribe({
        next: (products) => {
          this.allProducts = products;
          this.products = [...products];
          this.isLoading = false;
          console.log('✅ Products loaded with promotions:', products);
        },
        error: (error) => {
          console.error('❌ Error loading products:', error);
          this.isLoading = false;
        }
      });
  }

  filterProducts(): void {
    let filtered = this.allProducts;
    
    if (this.searchKeyword && this.searchKeyword.trim()) {
      const keyword = this.searchKeyword.toLowerCase().trim();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(keyword) ||
        (product.description && product.description.toLowerCase().includes(keyword))
      );
    }

    if (this.minPrice !== undefined && this.minPrice !== null && this.minPrice > 0) {
      filtered = filtered.filter(product => product.price >= this.minPrice!);
    }

    if (this.maxPrice !== undefined && this.maxPrice !== null && this.maxPrice > 0) {
      filtered = filtered.filter(product => product.price <= this.maxPrice!);
    }

    this.products = filtered;
  }

  onSearch(): void {
    this.filterProducts();
  }

  onPriceChange(): void {
    this.filterProducts();
  }

  clearFilters(): void {
    this.searchKeyword = '';
    this.minPrice = undefined;
    this.maxPrice = undefined;
    this.products = [...this.allProducts];
  }

  setViewMode(mode: 'grid' | 'list'): void {
    this.viewMode = mode;
  }

  addToCart(product: ProductResponse, quantity: number = 1): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.cartService.addItemToCart(product.id, quantity).subscribe({
      next: (cart) => {
        console.log('Product added to cart successfully');
      },
      error: (err) => {
        console.error('Error adding product to cart:', err);
      }
    });
  }

  viewProduct(product: ProductResponse): void {
    this.router.navigate(['/products', product.id]);
  }

  trackByProductId(index: number, product: Product): number {
    return product.id;
  }

  onImageError(event: any): void {
    event.target.src = 'assets/default-product.png';
  }

  private showNotification(message: string, type: 'success' | 'error'): void {
    if (type === 'success') {
      this.toastService.success(message);
    } else {
      this.toastService.error(message);
    }
  }
}