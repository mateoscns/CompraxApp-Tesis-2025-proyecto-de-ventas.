import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PaymentService, WhatsAppPaymentData } from '../../services/payment.service';
import { CartService } from '../../cart/cart.service';
import { OrderService } from '../../order/order.service';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-whatsapp-payment',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './whatsapp-payment.component.html',
  styleUrls: ['./whatsapp-payment.component.css']
})
export class WhatsappPaymentComponent implements OnInit {
  loading = false;
  error = '';
  orderData: any = {};
  vendorPhone = '543513091448';

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

  processWhatsAppPayment(): void {
    this.loading = true;
    this.error = '';

    const checkoutData = sessionStorage.getItem('checkoutData');
    if (!checkoutData) {
      this.error = 'No se encontraron datos del checkout.';
      this.loading = false;
      return;
    }

    const parsedCheckoutData = JSON.parse(checkoutData);

    const orderData = {
      shippingAddress: parsedCheckoutData.shippingAddress || 'Coordinar por WhatsApp'
    };

    this.orderService.createOrder(orderData).subscribe({
      next: (order) => {
        console.log('Order created:', order);
        
        this.orderService.requestWhatsAppPayment(order.id).subscribe({
          next: (response) => {
            this.cartService.clearCart().subscribe({
              next: () => {
                sessionStorage.removeItem('checkoutData');
                window.open(response.whatsappLink, '_blank');
                this.router.navigate(['/payment/success'], { 
                  queryParams: { order_id: order.id, method: 'whatsapp' }
                });
              },
              error: () => {
                sessionStorage.removeItem('checkoutData');
                window.open(response.whatsappLink, '_blank');
                this.router.navigate(['/payment/success'], { 
                  queryParams: { order_id: order.id, method: 'whatsapp' }
                });
              }
            });
          },
          error: (error) => {
            this.loading = false;
            this.error = 'Error al generar link de WhatsApp: ' + (error.message || 'Error desconocido');
          }
        });
      },
      error: (error) => {
        this.loading = false;
        this.error = 'Error al crear la orden: ' + (error.message || 'Error desconocido');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/payment/method-selection']);
  }
}
