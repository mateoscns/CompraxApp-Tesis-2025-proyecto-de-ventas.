import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService, LoginResponse } from '../../auth/auth.service';
import { CartService, CartDTO } from '../../cart/cart.service';
import { NotificationDropdownComponent } from '../../notifications/notification-dropdown/notification-dropdown.component';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterModule, NotificationDropdownComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit, OnDestroy {
  currentUser: LoginResponse | null = null;
  cartItemCount: number = 0;
  mobileMenuOpen = false;
  isUserMenuOpen = false;
  private authSubscription: Subscription | undefined;
  private cartSubscription: Subscription | undefined;

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authSubscription = this.authService.currentUser.subscribe((user: LoginResponse | null) => {
      this.currentUser = user;
      if (user) {
        this.loadCartInfo();
        this.loadUser();
      } else {
        this.cartItemCount = 0;
      }
    });

    this.cartSubscription = this.cartService.cart$.subscribe((cart: CartDTO | null) => {
      this.cartItemCount = cart ? cart.items.reduce((sum: number, item: any) => sum + item.quantity, 0) : 0;
    });
  }

  private loadCartInfo(): void {
    this.cartService.getCart().subscribe({
      next: (cart: CartDTO | null) => {
        this.cartItemCount = cart?.items?.length || 0;
      },
      error: (error: any) => {
        if (error.status !== 401) {
          console.error('Error loading cart in navbar:', error);
        }
        this.cartItemCount = 0;
      }
    });
  }

  loadUser(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.currentUser = user;
    }
  }

  logout(): void {
    this.authService.logout();
    this.closeMobileMenu();
    this.closeUserMenu(); 
  }

  get isLoggedIn(): boolean {
    return !!this.currentUser;
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  getUserName(): string {
    return this.currentUser?.name || this.currentUser?.email?.split('@')[0] || 'Usuario';
  }

  getUserInitials(): string {
    const name = this.getUserName();
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  closeUserMenu(): void {
    this.isUserMenuOpen = false;
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }
}
