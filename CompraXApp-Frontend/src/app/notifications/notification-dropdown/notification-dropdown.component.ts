import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NotificationService, Notification } from '../../services/notification.service';

@Component({
  selector: 'app-notification-dropdown',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-dropdown.component.html',
  styleUrl: './notification-dropdown.component.css'
})
export class NotificationDropdownComponent implements OnInit {
  notifications: Notification[] = [];
  unreadCount = 0;
  isLoading = true;
  isOpen = false;

  constructor(
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadNotifications();
    this.loadUnreadCount();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    const dropdown = target.closest('.notification-dropdown');
    if (!dropdown && this.isOpen) {
      this.closeDropdown();
    }
  }

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen && this.notifications.length === 0) {
      this.loadNotifications();
    }
  }

  closeDropdown(): void {
    this.isOpen = false;
  }

  loadNotifications(): void {
    this.isLoading = true;
    this.notificationService.getAllNotifications().subscribe({
      next: (notifications: Notification[]) => {
        this.notifications = notifications;
        this.unreadCount = notifications.filter((n: Notification) => !n.read).length;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading notifications:', error);
        this.isLoading = false;
        this.notifications = [];
        this.unreadCount = 0;
      }
    });
  }

  loadUnreadCount(): void {
    this.notificationService.getUnreadCount().subscribe({
      next: (response) => {
        this.unreadCount = response.unreadCount;
      },
      error: (error) => {
        console.error('Error loading unread count:', error);
        this.unreadCount = 0;
      }
    });
  }

  onNotificationClick(notification: Notification): void {
    this.navigateToOrder(notification);
    this.closeDropdown();
  }

  markAsRead(notificationId: number): void {
    this.notificationService.markAsRead(notificationId).subscribe({
      next: () => {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
          notification.read = true;
          this.unreadCount = Math.max(0, this.unreadCount - 1);
        }
      },
      error: (error) => {
        console.error('Error marking notification as read:', error);
      }
    });
  }

  navigateToOrder(notification: Notification): void {
    this.markAsRead(notification.id);
    
    if (notification.relatedOrderId) {
      this.router.navigate(['/order/details', notification.relatedOrderId]);
    }
  }

  getIcon(type: string): string {
    const icons = this.notificationService.getNotificationIcon(type);
    switch (type) {
      case 'ORDER_CREATED': return 'shopping-cart';
      case 'PAYMENT_CONFIRMED': return 'credit-card';
      case 'ORDER_SHIPPED': return 'truck';
      case 'ORDER_DELIVERED': return 'check-circle';
      case 'PROMOTION': return 'tag';
      default: return 'bell';
    }
  }

  getColor(type: string): string {
    return this.notificationService.getNotificationColor(type);
  }

  formatTime(dateInput: string | Date): string {
    try {
      let date: Date;
      
      if (typeof dateInput === 'string') {
        date = new Date(dateInput);
      } else if (dateInput instanceof Date) {
        date = dateInput;
      } else {
        return 'Invalid date';
      }

      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }

      const now = new Date();
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

      if (diffInMinutes < 1) return 'Ahora';
      if (diffInMinutes < 60) return `${diffInMinutes}m`;
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
      return `${Math.floor(diffInMinutes / 1440)}d`;
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'Error';
    }
  }

  viewAllNotifications(): void {
    this.router.navigate(['/notifications']);
    this.closeDropdown();
  }

  trackByNotificationId(index: number, notification: Notification): number {
    return notification.id;
  }
}
