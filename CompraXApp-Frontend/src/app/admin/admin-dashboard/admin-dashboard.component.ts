import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { AdminService, ProductSalesDTO } from '../admin.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
  salesStatistics: ProductSalesDTO[] = [];
  totalUsers: number = 0;
  totalProducts: number = 0;
  totalOrders: number = 0;
  isLoading = true;

  constructor(
    private adminService: AdminService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    if (!this.authService.isAdmin()) {
      this.router.navigate(['/products']);
      return;
    }

    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    
    // Cargar estadísticas de ventas
    this.adminService.getProductSalesStatistics().subscribe({
      next: (stats) => {
        this.salesStatistics = stats;
      },
      error: (err) => console.error('Error loading sales statistics:', err)
    });

    // Cargar contadores
    this.adminService.getAllUsers().subscribe({
      next: (users) => {
        this.totalUsers = users.length;
      },
      error: (err) => console.error('Error loading users count:', err)
    });

    this.adminService.getAllProducts().subscribe({
      next: (products) => {
        this.totalProducts = products.length;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading products count:', err);
        this.isLoading = false;
      }
    });

    this.adminService.getAllOrders().subscribe({
      next: (orders) => {
        this.totalOrders = orders.length;
      },
      error: (err) => console.error('Error loading orders count:', err)
    });
  }
}
