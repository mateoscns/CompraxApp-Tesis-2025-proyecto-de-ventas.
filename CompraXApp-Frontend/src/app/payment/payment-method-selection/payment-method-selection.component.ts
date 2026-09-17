import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { CartService, CartItemDTO } from '../../cart/cart.service';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-payment-method-selection',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-method-selection.component.html',
  styleUrls: ['./payment-method-selection.component.css']
})
export class PaymentMethodSelectionComponent implements OnInit {
  cartItems: CartItemDTO[] = [];
  total: number = 0;
  user: any;
  private isBrowser: boolean;

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    this.loadUserData();
    
    if (this.isBrowser) {
      const checkoutData = sessionStorage.getItem('checkoutData');
      
      if (!checkoutData) {
        this.router.navigate(['/order/checkout']);
        return;
      }
      
      this.loadCartDataAndValidate();
    }
  }

  validateCheckout(): void {
    if (this.cartItems.length === 0) {
      this.router.navigate(['/cart']);
      return;
    }
  }

  loadCartDataAndValidate(): void {
    const cart = this.cartService.getCurrentCartValue();
    
    if (cart && cart.items && cart.items.length > 0) {
      this.cartItems = cart.items;
      this.total = cart.totalAmount || 0;
      return;
    }
    
    this.cartService.cart$.subscribe(cartData => {
      if (cartData) {
        this.cartItems = cartData.items || [];
        this.total = cartData.totalAmount || 0;
      }
    });
    
    this.cartService.getCart().subscribe();
  }

  loadCartData(): void {
    const cart = this.cartService.getCurrentCartValue();
    this.cartItems = cart?.items || [];
    this.total = cart?.totalAmount || 0;
  }

  loadUserData(): void {
    this.user = this.authService.getCurrentUser();
  }

  selectMercadoPago(): void {
    this.router.navigate(['/payment/mercadopago']);
  }

  selectWhatsAppPayment(): void {
    this.router.navigate(['/payment/whatsapp']);
  }

  goBack(): void {
    this.router.navigate(['/order/checkout']);
  }
}
