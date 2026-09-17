import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';

export interface AdminPaymentDTO {
  id: number;
  orderId: number;
  method: 'MERCADO_PAGO' | 'WHATSAPP';
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  amount: number;
  paymentDate: string;
  externalPaymentId?: string;
}

export type { AdminPaymentDTO as PaymentDTO };

export interface ProductSalesDTO {
  productId: number;
  productName: string;
  totalQuantitySold: number;
  totalRevenue: number;
  category?: string;
  averageRating?: number;
}

export interface UserDTO {
  id: number;
  name: string;
  email: string;
  shippingAddress?: string;
  roles: string[];
  active: boolean;
}

export interface ProductSalesFilter {
  startDate?: string;
  endDate?: string;
  category?: string;
  limit?: number;
  sortBy?: 'quantity' | 'revenue';
  period?: 'week' | 'month' | '3months' | '6months' | 'year';
}

export interface SalesReportDTO {
  period: string;
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  periodStart: string;
  periodEnd: string;
}

export interface UserPurchaseStatisticsDTO {
  userId: number;
  userName: string;
  userEmail: string;
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  mostPurchasedProduct?: string;
}

export interface NotificationDTO {
  id: number;
  userId: number;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  relatedEntityId?: number;
  relatedEntityType?: string;
}

export interface ReportsSummary {
  productSales: ProductSalesDTO[];
  userStatistics: UserPurchaseStatisticsDTO[];
  salesReport: SalesReportDTO;
}


export interface PromotionDTO {
  id: number;
  title: string;
  description: string;
  discountPercentage: number;
  startDate: string;
  endDate: string;
  active: boolean;
  createdAt?: string;
}

export interface PromotionCreateRequest {
  title: string;
  description: string;
  discountPercentage: number;
  startDate: string;
  endDate: string;
  active?: boolean;
}

export interface PromotionResponse {
  message: string;
  promotionId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {}

  getPendingPayments(): Observable<AdminPaymentDTO[]> {
    return this.http.get<AdminPaymentDTO[]>(`${this.apiUrl}/admin/payments/pending`)
      .pipe(catchError(this.handleError.bind(this)));
  }

  confirmPayment(paymentId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/admin/payments/${paymentId}/confirm`, {})
      .pipe(catchError(this.handleError.bind(this)));
  }

  getProductSalesStatistics(filter?: ProductSalesFilter): Observable<ProductSalesDTO[]> {
    let params = new HttpParams();
    
    return this.http.get<ProductSalesDTO[]>(`${this.apiUrl}/admin/reports/product-sales`, {
      params,
      withCredentials: true
    }).pipe(catchError(this.handleError.bind(this)));
  }

  getSalesReportForPeriod(days?: number, startDate?: Date, endDate?: Date): Observable<SalesReportDTO> {
    let params = new HttpParams();
    
    if (startDate && endDate) {
      params = params.set('startDate', startDate.toISOString());
      params = params.set('endDate', endDate.toISOString());
    } else if (days) {
      params = params.set('days', days.toString());
    } else {
      params = params.set('days', '30');
    }
    
    return this.http.get<SalesReportDTO>(`${this.apiUrl}/admin/reports/sales/period`, {
      params,
      withCredentials: true
    }).pipe(catchError(this.handleError.bind(this)));
  }

  getUserPurchaseStatistics(startDate?: Date, endDate?: Date): Observable<UserPurchaseStatisticsDTO[]> {
    let params = new HttpParams();
    
    if (startDate && endDate) {
      params = params.set('startDate', startDate.toISOString());
      params = params.set('endDate', endDate.toISOString());
    }
    
    return this.http.get<UserPurchaseStatisticsDTO[]>(`${this.apiUrl}/admin/reports/users/statistics`, {
      params,
      withCredentials: true
    }).pipe(catchError(this.handleError.bind(this)));
  }

  getReportsSummary(): Observable<ReportsSummary> {
    return this.http.get<ReportsSummary>(`${this.apiUrl}/admin/reports/summary`, {
      withCredentials: true
    }).pipe(catchError(this.handleError.bind(this)));
  }

  getNotifications(): Observable<NotificationDTO[]> {
    return this.http.get<NotificationDTO[]>(`${this.apiUrl}/notifications`, {
      withCredentials: true
    }).pipe(catchError(this.handleError.bind(this)));
  }

  getUnreadNotifications(): Observable<NotificationDTO[]> {
    return this.http.get<NotificationDTO[]>(`${this.apiUrl}/notifications/unread`, {
      withCredentials: true
    }).pipe(catchError(this.handleError.bind(this)));
  }

  getUnreadNotificationsCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.apiUrl}/notifications/unread/count`, {
      withCredentials: true
    }).pipe(catchError(this.handleError.bind(this)));
  }

  markNotificationAsRead(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/notifications/${id}/read`, {}, {
      withCredentials: true
    }).pipe(catchError(this.handleError.bind(this)));
  }

  markAllNotificationsAsRead(): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/notifications/read-all`, {}, {
      withCredentials: true
    }).pipe(catchError(this.handleError.bind(this)));
  }

  getMyPayments(): Observable<AdminPaymentDTO[]> {
    return this.http.get<AdminPaymentDTO[]>(`${this.apiUrl}/payments/my-payments`, {
      withCredentials: true
    }).pipe(catchError(this.handleError.bind(this)));
  }

  getReceipt(orderId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/receipts/${orderId}`, {
      responseType: 'blob',
      withCredentials: true
    }).pipe(catchError(this.handleError.bind(this)));
  }

  getAllUsers(): Observable<UserDTO[]> {
    return this.http.get<UserDTO[]>(`${this.apiUrl}/users`)
      .pipe(catchError(this.handleError.bind(this)));
  }

  updateUserRoles(userId: number, roles: string[]): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/users/${userId}/roles`, roles)
      .pipe(catchError(this.handleError.bind(this)));
  }

  deleteUser(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/${userId}`)
      .pipe(catchError(this.handleError.bind(this)));
  }

  toggleUserStatus(userId: number): Observable<{ message: string; active: boolean }> {
    return this.http.put<{ message: string; active: boolean }>(`${this.apiUrl}/users/${userId}/toggle-status`, {})
      .pipe(catchError(this.handleError.bind(this)));
  }

  getAllProducts(keyword?: string, minPrice?: number, maxPrice?: number): Observable<any[]> {
    let params = new HttpParams();
    if (keyword) params = params.set('keyword', keyword);
    if (minPrice !== undefined) params = params.set('minPrice', minPrice.toString());
    if (maxPrice !== undefined) params = params.set('maxPrice', maxPrice.toString());
    
    return this.http.get<any[]>(`${this.apiUrl}/products`, { params })
      .pipe(catchError(this.handleError.bind(this)));
  }

  createProductJSON(productData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/products`, productData)
      .pipe(catchError(this.handleError.bind(this)));
  }

  updateProductJSON(productId: number, productData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/products/${productId}`, productData)
      .pipe(catchError(this.handleError.bind(this)));
  }

  deleteProduct(productId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/products/${productId}`)
      .pipe(catchError(this.handleError.bind(this)));
  }

  getAllOrders(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/orders`)
      .pipe(catchError(this.handleError.bind(this)));
  }

  updateOrderStatus(orderId: number, status: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/orders/${orderId}/status`, { status })
      .pipe(catchError(this.handleError.bind(this)));
  }

  getAllPromotions(): Observable<PromotionDTO[]> {
    return this.http.get<PromotionDTO[]>(`${this.apiUrl}/admin/promotions`, {
      withCredentials: true
    }).pipe(catchError(this.handleError.bind(this)));
  }

  getActivePromotions(): Observable<PromotionDTO[]> {
    return this.http.get<PromotionDTO[]>(`${this.apiUrl}/admin/promotions/active`, {
      withCredentials: true
    }).pipe(catchError(this.handleError.bind(this)));
  }

  getPromotionById(id: number): Observable<PromotionDTO> {
    return this.http.get<PromotionDTO>(`${this.apiUrl}/admin/promotions/${id}`, {
      withCredentials: true
    }).pipe(catchError(this.handleError.bind(this)));
  }

  createPromotion(promotion: PromotionCreateRequest): Observable<PromotionDTO> {
    return this.http.post<PromotionDTO>(`${this.apiUrl}/admin/promotions`, promotion, {
      withCredentials: true
    }).pipe(catchError(this.handleError.bind(this)));
  }

  updatePromotion(id: number, promotion: PromotionCreateRequest): Observable<PromotionDTO> {
    return this.http.put<PromotionDTO>(`${this.apiUrl}/admin/promotions/${id}`, promotion, {
      withCredentials: true
    }).pipe(catchError(this.handleError.bind(this)));
  }

  deletePromotion(id: number): Observable<{message: string}> {
    return this.http.delete<{message: string}>(`${this.apiUrl}/admin/promotions/${id}`, {
      withCredentials: true
    }).pipe(catchError(this.handleError.bind(this)));
  }

  togglePromotionStatus(id: number): Observable<PromotionDTO> {
    return this.http.patch<PromotionDTO>(`${this.apiUrl}/admin/promotions/${id}/toggle`, {}, {
      withCredentials: true
    }).pipe(catchError(this.handleError.bind(this)));
  }

  sendPromotionToAllUsers(id: number): Observable<{message: string}> {
    return this.http.post<{message: string}>(`${this.apiUrl}/admin/promotions/${id}/send`, {}, {
      withCredentials: true
    }).pipe(catchError(this.handleError.bind(this)));
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Error en operación admin';
    
    if (error.status === 401) {
      this.authService.logout();
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: this.router.url }
      });
      return throwError(() => new Error('Sesión expirada'));
    }
    
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.error?.error) {
      errorMessage = error.error.error;
    }
    
    return throwError(() => new Error(errorMessage));
  }
}
