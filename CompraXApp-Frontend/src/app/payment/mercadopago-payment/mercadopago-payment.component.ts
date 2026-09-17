import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PaymentService, PaymentRequest } from '../../services/payment.service';
import { CartService } from '../../cart/cart.service';
import { OrderService } from '../../order/order.service';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-mercadopago-payment',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mercadopago-payment.component.html',
  styleUrls: ['./mercadopago-payment.component.css']
})
export class MercadopagoPaymentComponent implements OnInit {
  loading = false;
  error = '';
  orderData: any = {};

  constructor(
    private paymentService: PaymentService,
    private cartService: CartService,
    private orderService: OrderService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.prepareOrderData();
  }

  prepareOrderData(): void {
    const cart = this.cartService.getCurrentCartValue();
    const user = this.authService.getCurrentUser();
    
    this.orderData = {
      items: cart?.items || [],
      total: cart?.totalAmount || 0,
      user: user
    };
  }

  processMercadoPagoPayment(): void {
    this.loading = true;
    this.error = '';

    const checkoutData = sessionStorage.getItem('checkoutData');
    if (!checkoutData) {
      this.error = 'Checkout data not found.';
      this.loading = false;
      return;
    }

    const parsedCheckoutData = JSON.parse(checkoutData);

    const orderData = {
      shippingAddress: parsedCheckoutData.shippingAddress
    };

    this.orderService.createOrder(orderData).subscribe({
      next: (order) => {
        console.log('Order created:', order);
        
        this.paymentService.generateMercadoPagoLink(order.id).subscribe({
          next: (response) => {
            this.cartService.clearCart().subscribe({
              next: () => {
                sessionStorage.removeItem('checkoutData');
                window.location.href = response.paymentLink;
              },
              error: () => {
                sessionStorage.removeItem('checkoutData');
                window.location.href = response.paymentLink;
              }
            });
          },
          error: (error) => {
            this.loading = false;
            this.error = 'Error generating payment link: ' + (error.message || 'Unknown error');
          }
        });
      },
      error: (error) => {
        this.loading = false;
        this.error = 'Error creating order: ' + (error.message || 'Unknown error');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/payment/method-selection']);
  }
}
