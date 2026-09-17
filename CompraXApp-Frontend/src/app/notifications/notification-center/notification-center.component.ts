import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { NotificationService, Notification } from '../../services/notification.service';

@Component({
  selector: 'app-notification-center',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-center.component.html',
  styleUrls: ['./notification-center.component.css']
})
export class NotificationCenterComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  loading = true;
  error = '';
  currentPage = 0;
  totalPages = 0;
  hasMore = true;
  private destroy$ = new Subject<void>();

  constructor(
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadNotifications();
    this.subscribeToNotifications();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadNotifications(page: number = 0): void {
    this.loading = true;
    this.currentPage = page;

    this.notificationService.getAllNotifications().subscribe({
      next: (notifications) => {
        this.notifications = notifications;
        this.hasMore = false;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error al cargar las notificaciones';
        this.loading = false;
        console.error('Error loading notifications:', error);
      }
    });
  }

  subscribeToNotifications(): void {
    this.notificationService.notifications$
      .pipe(takeUntil(this.destroy$))
      .subscribe(notifications => {
        this.notifications = notifications;
      });
  }

  onNotificationClick(notification: Notification): void {
    if (!notification.read) {
      this.markAsRead(notification.id);
    }

    if (notification.actionUrl) {
      this.router.navigate([notification.actionUrl]);
    } else if (notification.relatedOrderId) {
      this.router.navigate(['/order/details', notification.relatedOrderId]);
    }
  }

  markAsRead(notificationId: number): void {
    this.notificationService.markAsRead(notificationId).subscribe({
      next: () => {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
          notification.read = true;
        }
        this.notificationService.loadNotifications();
      },
      error: (error) => {
        console.error('Error marking notification as read:', error);
      }
    });
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notifications.forEach(n => n.read = true);
        this.notificationService.loadNotifications();
      },
      error: (error) => {
        console.error('Error marking all notifications as read:', error);
      }
    });
  }

  deleteNotification(notificationId: number, event: Event): void {
    event.stopPropagation();

    this.notificationService.deleteNotification(notificationId).subscribe({
      next: () => {
        this.notifications = this.notifications.filter(n => n.id !== notificationId);
        this.notificationService.loadNotifications();
      },
      error: (error) => {
        console.error('Error deleting notification:', error);
      }
    });
  }

  loadMore(): void {
    if (this.hasMore && !this.loading) {
      this.loadNotifications(this.currentPage + 1);
    }
  }

  getIcon(type: string): string {
    return this.notificationService.getNotificationIcon(type);
  }

  getColor(type: string): string {
    return this.notificationService.getNotificationColor(type);
  }

  getTimeAgo(dateInput: Date | string): string {
    try {
      const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
      
      if (isNaN(date.getTime())) {
        return 'Fecha inválida';
      }

      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (diffInSeconds < 60) {
        return 'Hace un momento';
      } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `Hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
      } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
      } else {
        const days = Math.floor(diffInSeconds / 86400);
        return `Hace ${days} día${days > 1 ? 's' : ''}`;
      }
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Error en fecha';
    }
  }

  get hasUnreadNotifications(): boolean {
    return this.notifications.some(n => !n.read);
  }
}
