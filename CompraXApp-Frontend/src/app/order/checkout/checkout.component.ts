import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../cart/cart.service'; 
import { OrderService } from '../order.service';
import { Cart } from '../../models/Cart';
import { AuthService } from '../../auth/auth.service'; 
import { CommonModule } from '@angular/common';
import { UserService } from '../../user/user.service';

@Component({
  selector: 'app-checkout',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent implements OnInit {
  checkoutForm: FormGroup;
  addressForm: FormGroup;
  cart: Cart | null = null;
  isLoading = true;
  isSubmitting = false;
  errorMessage: string = '';
  validationErrors: any = {};
  private isBrowser: boolean;

  provinces = [
    'Buenos Aires', 'CABA', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba',
    'Corrientes', 'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja',
    'Mendoza', 'Misiones', 'Neuquén', 'Río Negro', 'Salta', 'San Juan',
    'San Luis', 'Santa Cruz', 'Santa Fe', 'Santiago del Estero',
    'Tierra del Fuego', 'Tucumán'
  ];

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private orderService: OrderService,
    private authService: AuthService,
    private router: Router,
    private userService: UserService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.checkoutForm = this.fb.group({});
    
    this.addressForm = this.fb.group({
      street: ['', [Validators.required]],
      number: ['', [Validators.required]],
      floor: [''],
      apartment: [''],
      city: ['', [Validators.required]],
      province: ['', [Validators.required]],
      postalCode: ['', [Validators.required]],
      additionalInfo: ['']
    });
  }

  ngOnInit(): void {
    if (this.isBrowser && !this.authService.isLoggedIn()) {
      this.router.navigate(['/auth/login'], { queryParams: { returnUrl: '/order/checkout' } });
      return;
    }

    if (this.isBrowser) {
      this.loadUserAddress();
    }

    this.cartService.cart$.subscribe({
      next: (cartData) => {
        this.cart = cartData;
        this.isLoading = false;
        
        if (!this.hasItems()) {
          this.errorMessage = 'Your cart is empty. Add items before checkout.';
          setTimeout(() => {
            this.router.navigate(['/products']);
          }, 2000);
        }
      },
      error: (err) => {
        console.error("Failed to load cart for checkout", err);
        this.isLoading = false;
        this.errorMessage = 'Failed to load cart. Please try again.';
      }
    });

    if (!this.cartService.getCurrentCartValue()) {
      this.cartService.getCart().subscribe({
        error: (err) => {
          console.error("Failed to load cart initially", err);
          this.isLoading = false;
          this.errorMessage = 'Failed to load cart. Please try again.';
        }
      });
    }
  }

  getTotal(): number {
    if (!this.cart || !this.cart.items) return 0;
    return this.cart.totalAmount || this.cart.items.reduce((total, item) => total + (item.quantity * item.pricePerUnit), 0);
  }

  calculateTotal(): number {
    if (!this.cart?.items) return 0;
    return this.cart.items.reduce((total, item) => total + (item.quantity * item.pricePerUnit), 0);
  }

  hasItems(): boolean {
    return !!(this.cart && this.cart.items && this.cart.items.length > 0);
  }

  placeOrder(): void {
    this.validationErrors = {};
    this.errorMessage = '';

    if (this.addressForm.invalid) {
      this.markFormGroupTouched(this.addressForm);
      this.errorMessage = 'Please fill in all required address fields.';
      return;
    }

    if (!this.hasItems()) {
      this.errorMessage = 'Your cart is empty. Cannot place order.';
      return;
    }
    
    this.isSubmitting = true;
    this.errorMessage = '';

    const combinedAddress = this.combineAddress();

    const checkoutData = {
      shippingAddress: combinedAddress
    };

    sessionStorage.setItem('checkoutData', JSON.stringify(checkoutData));
    
    this.isSubmitting = false;
    this.router.navigate(['/payment/method-selection']);
  }

  private loadUserAddress(): void {
    this.userService.getMyProfile().subscribe({
      next: (profile) => {
        if (profile.shippingAddress) {
          const addressData = this.parseAddress(profile.shippingAddress);
          this.addressForm.patchValue(addressData);
        }
      },
      error: (err) => {
        console.log('Could not load user profile for address:', err);
      }
    });
  }

  private parseAddress(address: string): any {
    const defaultAddress = {
      street: '',
      number: '',
      floor: '',
      apartment: '',
      city: '',
      province: '',
      postalCode: '',
      additionalInfo: ''
    };

    if (!address || address.trim() === '') {
      return defaultAddress;
    }

    if (address.includes('||ADDR||')) {
      const parseablePart = address.split('||ADDR||')[1];
      const parts = parseablePart.split('|').map(p => p.trim());
      return {
        street: parts[0] || '',
        number: parts[1] || '',
        floor: parts[2] || '',
        apartment: parts[3] || '',
        city: parts[4] || '',
        province: parts[5] || '',
        postalCode: parts[6] || '',
        additionalInfo: parts[7] || ''
      };
    }

    return {
      ...defaultAddress,
      additionalInfo: address
    };
  }

  private combineAddress(): string {
    const addr = this.addressForm.value;
    const parts: string[] = [];
    
    if (addr.street && addr.number) {
      parts.push(`${addr.street} ${addr.number}`);
    }
    
    if (addr.floor || addr.apartment) {
      const floorApt: string[] = [];
      if (addr.floor) floorApt.push(`Piso ${addr.floor}`);
      if (addr.apartment) floorApt.push(`Depto ${addr.apartment}`);
      parts.push(floorApt.join(', '));
    }
    
    if (addr.city) {
      parts.push(addr.city);
    }
    
    if (addr.province) {
      let provincePart = addr.province;
      if (addr.postalCode) {
        provincePart += ` (CP ${addr.postalCode})`;
      }
      parts.push(provincePart);
    }
    
    if (addr.additionalInfo) {
      parts.push(`- ${addr.additionalInfo}`);
    }
    
    const parseableFormat = [
      addr.street || '',
      addr.number || '',
      addr.floor || '',
      addr.apartment || '',
      addr.city || '',
      addr.province || '',
      addr.postalCode || '',
      addr.additionalInfo || ''
    ].join('|');
    
    return parts.join(', ') + ' ||ADDR||' + parseableFormat;
  }

  isAddressFieldInvalid(fieldName: string): boolean {
    const field = this.addressForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.checkoutForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.checkoutForm.get(fieldName);
    if (field && field.errors && (field.dirty || field.touched)) {
      if (field.errors['required']) {
        return `${fieldName} is required`;
      }
      if (field.errors['minlength']) {
        return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
      if (field.errors['maxlength']) {
        return `${fieldName} must be no more than ${field.errors['maxlength'].requiredLength} characters`;
      }
    }
    return '';
  }
}