import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthService } from '../auth/auth.service';
import jsPDF from 'jspdf';

export interface OrderDTO {
  id: number;
  userId: number;
  userName: string;
  orderDate: string;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  shippingStatus: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED';
  totalAmount: number;
  shippingAddress: string;
  trackingNumber?: string;
  shippingDate?: string;
  deliveryDate?: string;
  createdAt?: string;
  paymentMethod?: string;
  items: OrderItemDTO[];
  user?: {
    name: string;
    email: string;
  };
}

export interface OrderItemDTO {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  pricePerUnit: number;
}

export interface CreateOrderRequest {
  shippingAddress: string;
}

export interface ReceiptResponse {
  receipt: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient, private authService: AuthService) { }

  createOrder(orderData: CreateOrderRequest): Observable<OrderDTO> {
    if (!this.authService.isLoggedIn()) {
      return throwError(() => new Error('User not logged in'));
    }

    if (!orderData.shippingAddress || orderData.shippingAddress.trim().length < 10) {
      return throwError(() => new Error('Shipping address must be at least 10 characters long'));
    }
   
    return this.http.post<OrderDTO>(this.apiUrl, orderData).pipe(catchError(this.handleError));
  }

  getUserOrders(): Observable<OrderDTO[]> {
    return this.http.get<OrderDTO[]>(`${this.apiUrl}/my-orders`).pipe(catchError(this.handleError));
  }

  getOrderById(orderId: number): Observable<OrderDTO> {
    return this.getOrderDetails(orderId);
  }

  getOrderDetails(orderId: number): Observable<OrderDTO> {
    return this.http.get<OrderDTO>(`${this.apiUrl}/${orderId}/details`).pipe(catchError(this.handleError));
  }

  requestWhatsAppPayment(orderId: number): Observable<{whatsappLink: string}> {
    return this.http.post<{whatsappLink: string}>(`${this.apiUrl}/${orderId}/whatsapp-payment`, {}).pipe(catchError(this.handleError));
  }

  cancelOrder(orderId: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${orderId}/cancel`, {}).pipe(catchError(this.handleError));
  }

  getReceipt(orderId: number): Observable<ReceiptResponse> {
    return this.http.get<ReceiptResponse>(`${environment.apiUrl}/receipts/${orderId}`)
      .pipe(catchError(this.handleError));
  }

  downloadReceipt(orderId: number): Observable<Blob> {
    return this.http.get(`${environment.apiUrl}/receipts/${orderId}`, {
      responseType: 'text'
    }).pipe(
      map(receipt => new Blob([receipt], { type: 'text/plain' })),
      catchError(this.handleError)
    );
  }

  async generateReceiptPDF(orderId: number): Promise<void> {
    try {
      const response = await this.getReceipt(orderId).toPromise();
      if (!response) return;

      const orderDetails = await this.getOrderById(orderId).toPromise();
      if (!orderDetails) return;

      const pdf = new jsPDF();
      
      this.designProfessionalReceipt(pdf, orderDetails, response.receipt);
      
      pdf.save(`comprobante-${orderId}.pdf`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  }

  private designProfessionalReceipt(pdf: jsPDF, order: OrderDTO, receiptText: string): void {
    const pageWidth = pdf.internal.pageSize.width;
    const pageHeight = pdf.internal.pageSize.height;
    let currentY = 20;

    pdf.setFillColor(0, 123, 255);
    pdf.rect(0, 0, pageWidth, 40, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text('COMPROBANTE DE COMPRA', pageWidth / 2, 20, { align: 'center' });
    
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'normal');
    pdf.text('CompraXApp', pageWidth / 2, 30, { align: 'center' });

    currentY = 50;

    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    
    pdf.text(`Pedido #: ${order.id}`, 20, currentY);
    pdf.text(`Fecha: ${new Date(order.orderDate).toLocaleDateString('es-ES')}`, 20, currentY + 10);
    pdf.text(`Estado: ${this.getStatusText(order.status)}`, 20, currentY + 20);
    
    const customerName = order.userName || order.user?.name || 'Usuario';
    const customerEmail = order.user?.email || '';
    
    pdf.text(`Cliente: ${customerName}`, 20, currentY + 30);
    if (customerEmail) {
      pdf.text(`Email: ${customerEmail}`, 20, currentY + 40);
      currentY += 50;
    } else {
      currentY += 40;
    }
    
    if (order.shippingAddress) {
      pdf.text(`Dirección: ${order.shippingAddress}`, 20, currentY);
      currentY += 20;
    }

    pdf.setDrawColor(200, 200, 200);
    pdf.line(20, currentY, pageWidth - 20, currentY);
    currentY += 10;

    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('PRODUCTOS:', 20, currentY);
    currentY += 15;

    pdf.setFillColor(245, 245, 245);
    pdf.rect(20, currentY - 5, pageWidth - 40, 15, 'F');
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Producto', 25, currentY + 5);
    pdf.text('Cant.', pageWidth - 120, currentY + 5);
    pdf.text('Precio Unit.', pageWidth - 80, currentY + 5);
    pdf.text('Subtotal', pageWidth - 40, currentY + 5);
    
    currentY += 20;

    pdf.setFont('helvetica', 'normal');
    let totalAmount = 0;

    if (order.items && order.items.length > 0) {
      order.items.forEach((item: any) => {
        const quantity = this.getItemQuantity(item);
        const price = this.getItemPrice(item);
        const subtotal = quantity * price;
        totalAmount += subtotal;

        const productName = item.productName.length > 25 
          ? item.productName.substring(0, 25) + '...' 
          : item.productName;

        pdf.text(productName, 25, currentY);
        pdf.text(quantity.toString(), pageWidth - 115, currentY);
        pdf.text(`$${price.toFixed(2)}`, pageWidth - 85, currentY);
        pdf.text(`$${subtotal.toFixed(2)}`, pageWidth - 45, currentY);
        
        currentY += 12;

        if (currentY > pageHeight - 60) {
          pdf.addPage();
          currentY = 20;
        }
      });
    }

    currentY += 10;
    pdf.setDrawColor(0, 123, 255);
    pdf.setLineWidth(2);
    pdf.line(pageWidth - 100, currentY - 5, pageWidth - 20, currentY - 5);
    
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`TOTAL: $${(order.totalAmount || totalAmount).toFixed(2)}`, pageWidth - 45, currentY + 5, { align: 'right' });

    currentY = pageHeight - 40;
    pdf.setFillColor(0, 123, 255);
    pdf.rect(0, currentY, pageWidth, 40, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text('¡Gracias por tu compra!', pageWidth / 2, currentY + 15, { align: 'center' });
    pdf.text('CompraXApp - Tu tienda online de confianza', pageWidth / 2, currentY + 25, { align: 'center' });
    
    pdf.setFontSize(8);
    pdf.text(`Generado el: ${new Date().toLocaleString('es-ES')}`, pageWidth / 2, currentY + 35, { align: 'center' });
  }

  private getStatusText(status: string): string {
    const statusTexts: { [key: string]: string } = {
      'PENDING': 'Pendiente',
      'PROCESSING': 'Procesando',
      'SHIPPED': 'Enviado',
      'DELIVERED': 'Entregado',
      'CANCELLED': 'Cancelado'
    };
    return statusTexts[status] || status;
  }

  private getItemQuantity(item: any): number {
    return item.quantity || 1;
  }

  private getItemPrice(item: any): number {
    return item.pricePerUnit || item.price || 0;
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Error en la orden';
    
    if (error.status === 401) {
      errorMessage = 'No autorizado';
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.error?.error) {
      errorMessage = error.error.error;
    }
    
    return throwError(() => new Error(errorMessage));
  }
}