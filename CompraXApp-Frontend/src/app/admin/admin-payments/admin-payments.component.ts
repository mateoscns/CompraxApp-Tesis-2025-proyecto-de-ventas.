import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService, PaymentDTO as AdminPaymentDTO } from '../admin.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-admin-payments',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-payments.component.html',
  styleUrl: './admin-payments.component.css'
})
export class AdminPaymentsComponent implements OnInit {
  pendingPayments: AdminPaymentDTO[] = [];
  allPayments: AdminPaymentDTO[] = [];
  isLoading = true;
  errorMessage = '';
  selectedTab: 'pending' | 'all' = 'pending';
  
  pendingPaymentsAvailable = true;
  allPaymentsAvailable = true;

  constructor(private adminService: AdminService, private toastService: ToastService) { }

  ngOnInit(): void {
    this.loadPayments();
  }

  loadPayments(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.adminService.getPendingPayments().subscribe({
      next: (payments) => {
        this.pendingPayments = payments;
        this.pendingPaymentsAvailable = true;
        console.log('✅ Pending payments loaded:', payments);
        this.checkLoadingComplete();
      },
      error: (err) => {
        console.error('❌ Error loading pending payments:', err);
        if (err.status === 500 || err.status === 404) {
          this.pendingPaymentsAvailable = false;
        }
        this.checkLoadingComplete();
      }
    });
  }

  private checkLoadingComplete(): void {
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }

  confirmPayment(paymentId: number): void {
    if (!confirm('Are you sure you want to confirm this payment?')) {
      return;
    }

    this.adminService.confirmPayment(paymentId).subscribe({
      next: (response) => {
        console.log('✅ Payment confirmed:', response);
        this.toastService.success('Payment confirmed successfully!');
        this.loadPayments();
      },
      error: (err) => {
        console.error('❌ Error confirming payment:', err);
        if (err.status === 500) {
          this.toastService.warning('Payment confirmation endpoint not implemented in backend yet.');
        } else {
          this.toastService.error('Error confirming payment: ' + (err.error?.error || err.message));
        }
      }
    });
  }

  getStatusBadgeClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'completed': return 'badge-success';
      case 'pending': return 'badge-warning';
      case 'failed': return 'badge-danger';
      case 'cancelled': return 'badge-secondary';
      default: return 'badge-secondary';
    }
  }

  getMethodBadgeClass(method: string): string {
    switch (method.toLowerCase()) {
      case 'mercado_pago': return 'badge-primary';
      case 'whatsapp_coordination': return 'badge-success';
      default: return 'badge-secondary';
    }
  }

  formatPaymentMethod(method: string): string {
    switch (method) {
      case 'MERCADO_PAGO': return 'MercadoPago';
      case 'WHATSAPP_COORDINATION': return 'WhatsApp';
      default: return method;
    }
  }

  switchTab(tab: 'pending' | 'all'): void {
    this.selectedTab = tab;
  }

  refreshData(): void {
    this.loadPayments();
  }
}
