import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';
import { PromotionService, ProductWithPromotion } from '../services/promotion.service';

export interface CartDTO {
  id: number;
  items: CartItemDTO[];
  totalAmount: number;
  originalTotalAmount?: number;
  totalDiscount?: number;
}

export interface CartItemDTO {
  id: number;
  productId: number;
  productName: string;
  pricePerUnit: number;
  originalPrice?: number;
  quantity: number;
  imageUrl?: string;
  discountPercentage?: number;
  hasPromotion?: boolean;
  promotionTitle?: string;
}

@Injectable({
  providedIn: 'root' 
})
export class CartService {
  private apiUrl = `${environment.apiUrl}/cart`;
  private cartSubject = new BehaviorSubject<CartDTO | null>(null);
  public cart$ = this.cartSubject.asObservable();

  constructor(
    private http: HttpClient, 
    private authService: AuthService,
    private router: Router,
    private promotionService: PromotionService
  ) { 
    this.loadCart();
  }

  getCart(): Observable<CartDTO> {
    if (!this.authService.isLoggedIn()) {
      return throwError(() => new Error('User not logged in.'));
    }
    return this.http.get<CartDTO>(this.apiUrl).pipe(
      map(cart => this.applyPromotionsToCart(cart)),
      tap(cart => {
        console.log('Cart loaded:', cart);
        this.cartSubject.next(cart);
      }),
      catchError(this.handleError.bind(this))
    );
  }

  private applyPromotionsToCart(cart: CartDTO): CartDTO {
    if (!cart || !cart.items) return cart;

    const updatedItems = cart.items.map(item => {
      const tempProduct = {
        id: item.productId,
        name: item.productName,
        price: item.originalPrice || item.pricePerUnit,
        stockQuantity: 999,
        active: true
      };

      const productWithPromotion = this.promotionService.applyPromotionToProduct(tempProduct);

      return {
        ...item,
        pricePerUnit: productWithPromotion.price,
        originalPrice: productWithPromotion.originalPrice,
        discountPercentage: productWithPromotion.discountPercentage,
        hasPromotion: productWithPromotion.hasPromotion,
        promotionTitle: productWithPromotion.promotionTitle
      };
    });

    const newTotalAmount = updatedItems.reduce((total, item) => {
      return total + (item.pricePerUnit * item.quantity);
    }, 0);

    return {
      ...cart,
      items: updatedItems,
      totalAmount: newTotalAmount
    };
  }

  addItemToCart(productId: number, quantity: number): Observable<CartDTO> {
    if (!this.authService.isLoggedIn()) {
      return throwError(() => new Error('User not logged in.'));
    }

    const params = new HttpParams()
      .set('productId', productId.toString())
      .set('quantity', quantity.toString());

    return this.http.post<CartDTO>(`${this.apiUrl}/items`, null, { params }).pipe(
      tap(cart => {
        console.log('Item added to cart:', cart);
        this.cartSubject.next(cart);
      }),
      catchError(this.handleError.bind(this))
    );
  }

  updateCartItem(productId: number, quantity: number): Observable<CartDTO> {
    if (!this.authService.isLoggedIn()) {
      return throwError(() => new Error('User not logged in.'));
    }

    const params = new HttpParams().set('quantity', quantity.toString());

    return this.http.put<CartDTO>(`${this.apiUrl}/items/${productId}`, null, { params }).pipe(
      tap(cart => {
        console.log('Cart item updated:', cart);
        this.cartSubject.next(cart);
      }),
      catchError(this.handleError.bind(this))
    );
  }

  removeCartItem(productId: number): Observable<CartDTO> {
    if (!this.authService.isLoggedIn()) {
      return throwError(() => new Error('User not logged in.'));
    }

    return this.http.delete<CartDTO>(`${this.apiUrl}/items/${productId}`).pipe(
      tap(cart => {
        console.log('Item removed from cart:', cart);
        this.cartSubject.next(cart);
      }),
      catchError(this.handleError.bind(this))
    );
  }

  clearCart(): Observable<void> {
    if (!this.authService.isLoggedIn()) {
      return throwError(() => new Error('User not logged in.'));
    }

    return this.http.delete<void>(this.apiUrl).pipe(
      tap(() => {
        console.log('Cart cleared');
        this.cartSubject.next(null);
      }),
      catchError(this.handleError.bind(this))
    );
  }

  getCurrentCartValue(): CartDTO | null {
    return this.cartSubject.value;
  }

  getTotal(): number {
    const cart = this.getCurrentCartValue();
    return cart?.totalAmount || 0;
  }

  calculateCartTotal(cart: CartDTO | null): number {
    if (!cart?.items) return 0;
    return cart.items.reduce((total, item) => total + (item.quantity * item.pricePerUnit), 0);
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Cart error';
    
    if (error.status === 401) {
      this.authService.logout();
      return throwError(() => new Error('Session expired. Please log in again.'));
    }
    
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.error?.error) {
      errorMessage = error.error.error;
    }
    
    return throwError(() => new Error(errorMessage));
  }

  addToCart(productId: number, quantity: number = 1): Observable<CartDTO> {
    const request = { productId, quantity };
    return this.http.post<CartDTO>(this.apiUrl, request).pipe(
      map(cart => this.applyPromotionsToCart(cart)),
      tap(cart => this.cartSubject.next(cart))
    );
  }

  updateQuantity(cartItemId: number, quantity: number): Observable<CartDTO> {
    return this.http.put<CartDTO>(`${this.apiUrl}/update`, { cartItemId, quantity }).pipe(
      map(cart => this.applyPromotionsToCart(cart)),
      tap(cart => this.cartSubject.next(cart))
    );
  }

  private loadCart(): void {
    this.getCart().subscribe({
      next: (cart) => {
        console.log('✅ Cart loaded with promotions:', cart);
      },
      error: (error) => {
        console.log('ℹ️ No active cart found or user not logged in');
        this.cartSubject.next(null);
      }
    });
  }
}