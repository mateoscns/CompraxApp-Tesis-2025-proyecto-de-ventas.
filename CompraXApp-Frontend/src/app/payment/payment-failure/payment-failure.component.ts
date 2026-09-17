import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

interface TransactionDetails {
  transactionId?: string;
  amount?: number;
  date?: Date;
  reason?: string;
}

@Component({
  selector: 'app-payment-failure',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-failure.component.html',
  styleUrl: './payment-failure.component.css'
})
export class PaymentFailureComponent implements OnInit {
  orderId: string | null = null;
  paymentId: string | null = null;
  errorMessage: string = '';
  status: string = '';
  
  transactionDetails: TransactionDetails | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.orderId = params['order_id'] || null;
      this.paymentId = params['payment_id'] || null;
      this.status = params['status'] || 'failure';
      this.errorMessage = params['error'] || 'Payment could not be processed successfully.';
      
      this.transactionDetails = {
        transactionId: this.paymentId || 'N/A',
        amount: params['amount'] ? parseFloat(params['amount']) : undefined,
        date: new Date(),
        reason: this.errorMessage
      };
      
      console.log('Payment failure params:', params);
    });
  }

  goToCart(): void {
    this.router.navigate(['/cart']);
  }

  goToHome(): void {
    this.router.navigate(['/products']);
  }

  retryPayment(): void {
    if (this.orderId) {
      this.router.navigate(['/payment/method-selection'], {
        queryParams: { order_id: this.orderId }
      });
    } else {
      this.router.navigate(['/cart']);
    }
  }

  chooseAnotherMethod(): void {
    this.router.navigate(['/payment/method-selection']);
  }

  backToCart(): void {
    this.router.navigate(['/cart']);
  }

  contactSupport(): void {
    this.router.navigate(['/contact']);
  }
}
