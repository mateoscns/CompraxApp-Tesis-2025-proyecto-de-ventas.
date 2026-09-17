import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PaymentDTO {
  id: number;
  orderId: number;
  method: 'MERCADO_PAGO' | 'WHATSAPP';
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  amount: number;
  paymentDate: string;
  externalPaymentId?: string;
}

export interface MercadoPagoResponse {
  paymentId: number;
  paymentLink: string;
  instructions: string;
  amount: number;
}

export interface PaymentConfirmationResponse {
  message: string;
  paymentId: number;
  transactionId: string;
}

export interface PaymentRequest {
  orderId: number;
  amount: number;
  description: string;
}

export interface WhatsAppPaymentData {
  vendorPhone: string;
  message: string;
  orderDetails: any;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = `${environment.apiUrl}/payments`;

  constructor(private http: HttpClient) {}

  getMyPayments(): Observable<PaymentDTO[]> {
    return this.http.get<PaymentDTO[]>(`${this.apiUrl}/my-payments`);
  }

  generateMercadoPagoLink(orderId: number): Observable<MercadoPagoResponse> {
    const params = new HttpParams().set('orderId', orderId.toString());
    return this.http.post<MercadoPagoResponse>(`${this.apiUrl}/mercadopago/generate-link`, null, { params });
  }

  confirmPayment(paymentId: number, transactionId: string): Observable<PaymentConfirmationResponse> {
    const params = new HttpParams().set('transactionId', transactionId);
    return this.http.post<PaymentConfirmationResponse>(`${this.apiUrl}/confirm-payment/${paymentId}`, null, { params });
  }

  getAllPayments(): Observable<PaymentDTO[]> {
    return this.http.get<PaymentDTO[]>(`${this.apiUrl}/all`, {
      withCredentials: true
    });
  }

  getPendingPayments(): Observable<PaymentDTO[]> {
    return this.http.get<PaymentDTO[]>(`${this.apiUrl}/pending`, {
      withCredentials: true
    });
  }

  adminConfirmPayment(paymentId: number): Observable<{message: string}> {
    return this.http.post<{message: string}>(`${environment.apiUrl}/admin/payments/${paymentId}/confirm`, {}, {
      withCredentials: true
    });
  }
}
