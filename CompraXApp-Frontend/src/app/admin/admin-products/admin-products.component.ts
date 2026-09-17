import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms'; 
import { AdminService } from '../admin.service';
import { AuthService } from '../../auth/auth.service';
import { Product } from '../../models/Product';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule], 
  templateUrl: './admin-products.component.html',
  styleUrl: './admin-products.component.css' 
})
export class AdminProductsComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  isLoading = true;
  searchKeyword: string = '';
  minPrice: number | undefined;
  maxPrice: number | undefined;
  selectedProduct: Product | null = null;

  constructor(
    private adminService: AdminService,
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    if (!this.authService.isAdmin()) {
      this.router.navigate(['/products']);
      return;
    }

    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading = true;
    this.adminService.getAllProducts(this.searchKeyword, this.minPrice, this.maxPrice).subscribe({
      next: (products) => {
        this.products = products;
        this.filteredProducts = products;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    this.loadProducts();
  }

  clearFilters(): void {
    this.searchKeyword = '';
    this.minPrice = undefined;
    this.maxPrice = undefined;
    this.loadProducts();
  }

  editProduct(product: Product): void {
    this.router.navigate(['/admin/products/edit', product.id]);
  }

  deleteProduct(product: Product): void {
    if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
      this.adminService.deleteProduct(product.id).subscribe({
        next: () => {
          this.toastService.success('Product deleted successfully');
          this.loadProducts();
        },
        error: (err) => {
          console.error('Error deleting product:', err);
          this.toastService.error('Failed to delete product: ' + (err.error?.message || 'Please try again'));
        }
      });
    }
  }

  toggleProductStatus(product: Product): void {
    console.log('Toggle product status:', product);
  }

  selectProduct(product: Product): void {
    this.selectedProduct = product;
  }

  closeDetails(): void {
    this.selectedProduct = null;
  }

  onImageError(event: any): void {
    event.target.src = 'assets/default-product.png';
  }
}
