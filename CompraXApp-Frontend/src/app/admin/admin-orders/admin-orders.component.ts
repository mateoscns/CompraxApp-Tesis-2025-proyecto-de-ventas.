import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../admin.service';
import { ToastService } from '../../services/toast.service';

interface Order {
  id: number;
  userId: number;
  userName: string;
  totalAmount: number;
  status: string;
  shippingAddress: string;
  orderDate: Date;
  items: Array<{
    productName: string;
    quantity: number;
    price: number;
    subtotal: number;
  }>;
}

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-orders.component.html',
  styleUrl: './admin-orders.component.css'
})
export class AdminOrdersComponent implements OnInit {
  orders: Order[] = [];
  isLoading = true;
  selectedStatus = '';
  searchKeyword = '';

  orderStatuses = [
    { value: '', label: 'All Orders' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'PROCESSING', label: 'Processing' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' }
  ];

  constructor(private adminService: AdminService, private toastService: ToastService) { }

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading = true;
    this.adminService.getAllOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading orders:', err);
        this.isLoading = false;
      }
    });
  }

  updateOrderStatus(order: Order, newStatus: string): void {
    if (order.status === newStatus) return;

    const allowedStatuses = ['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED'];
    if (!allowedStatuses.includes(newStatus)) {
      this.toastService.warning(`Status "${newStatus}" is not allowed. Valid statuses: ${allowedStatuses.join(', ')}`);
      return;
    }

    if (confirm(`Change order #${order.id} status from ${order.status} to ${newStatus}?`)) {
      console.log(`🔄 Updating order ${order.id} status from ${order.status} to ${newStatus}`);
      
      this.adminService.updateOrderStatus(order.id, newStatus).subscribe({
        next: (response) => {
          console.log('✅ Status update successful:', response);
          order.status = newStatus;
          this.toastService.success('Order status updated successfully');
        },
        error: (err) => {
          console.error('❌ Status update failed:', err);
          
          let errorMessage = 'Failed to update order status';
          if (err.error?.error) {
            errorMessage = err.error.error;
          }
          
          this.toastService.error(errorMessage);
        }
      });
    }
  }

  get filteredOrders(): Order[] {
    let filtered = this.orders;

    if (this.selectedStatus) {
      filtered = filtered.filter(order => order.status === this.selectedStatus);
    }

    if (this.searchKeyword) {
      const keyword = this.searchKeyword.toLowerCase();
      filtered = filtered.filter(order => 
        order.id.toString().includes(keyword) ||
        (order.userName && order.userName.toLowerCase().includes(keyword)) ||
        (order.shippingAddress && order.shippingAddress.toLowerCase().includes(keyword))
      );
    }

    return filtered;
  }

  getStatusClass(status: string): string {
    return `status-${status.toLowerCase()}`;
  }

  getTotalItems(order: Order): number {
    return order.items.reduce((total, item) => total + item.quantity, 0);
  }
}
