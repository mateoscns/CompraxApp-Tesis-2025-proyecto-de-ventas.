import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../order.service';
import { AuthService } from '../../auth/auth.service';
import { ProductService } from '../../product/product.service';
import { ToastService } from '../../services/toast.service';

interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  pricePerUnit: number;
  imageUrl?: string;
}

interface Order {
  id: number;
  userId: number;
  status: string;
  totalAmount: number;
  shippingAddress: string;
  paymentMethod?: string;
  createdAt: string;
  items: OrderItem[];
}

@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-details.component.html',
  styleUrls: ['./order-details.component.css']
})
export class OrderDetailsComponent implements OnInit {
  order: Order | null = null;
  loading = true;
  error = '';
  orderId: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService,
    private authService: AuthService,
    private productService: ProductService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.route.params.subscribe(params => {
      this.orderId = +params['id'];
      if (this.orderId) {
        this.loadOrderDetails();
      } else {
        this.error = 'Invalid order ID';
        this.loading = false;
      }
    });
  }

  loadOrderDetails(): void {
    this.loading = true;
    this.error = '';
    
    this.orderService.getOrderById(this.orderId).subscribe({
      next: (response) => {
        console.log('🔍 Order response from backend:', response);
        
        this.order = this.adaptOrderData(response);
        
        console.log('🔍 Adapted order data:', this.order);
        
        this.loadProductImages();
      },
      error: (err) => {
        console.error('❌ Error loading order:', err);
        this.error = 'Failed to load order details. Please try again.';
        this.loading = false;
      }
    });
  }

  private loadProductImages(): void {
    if (!this.order?.items || this.order.items.length === 0) {
      this.loading = false;
      return;
    }

    console.log('🔍 Loading product images for items:', this.order.items);

    const imagePromises = this.order.items.map(item => {
      return new Promise<void>((resolve) => {
        if (item.productId) {
          this.productService.getProductById(item.productId).subscribe({
            next: (product) => {
              console.log(`🔍 Loaded product ${item.productId}:`, product);
              if (product && product.imageUrl) {
                item.imageUrl = product.imageUrl;
                console.log(`✅ Updated image for ${item.productName}:`, item.imageUrl);
              }
              resolve();
            },
            error: (err) => {
              console.warn(`⚠️ Failed to load product ${item.productId}:`, err);
              resolve();
            }
          });
        } else {
          resolve();
        }
      });
    });

    Promise.all(imagePromises).then(() => {
      console.log('🔍 Final order with loaded images:', this.order);
      this.loading = false;
    });
  }

  private adaptOrderData(backendData: any): Order {
    console.log('🔍 Raw backend data:', backendData);

    const order: Order = {
      id: backendData.id || 0,
      userId: backendData.userId || backendData.user_id || 0,
      status: backendData.status || 'UNKNOWN',
      totalAmount: this.parsePrice(backendData.totalAmount || backendData.total_amount || backendData.total || 0),
      shippingAddress: backendData.shippingAddress || backendData.shipping_address || 'No address provided',
      paymentMethod: backendData.paymentMethod || backendData.payment_method || 'Unknown',
      createdAt: backendData.createdAt || backendData.created_at || new Date().toISOString(),
      items: this.adaptOrderItems(backendData.items || backendData.orderItems || [])
    };

    console.log('🔍 Final adapted order:', order);
    return order;
  }

  getFormattedShippingAddress(): string {
    if (!this.order?.shippingAddress) return 'No address provided';
    
    const address = this.order.shippingAddress;
    
    if (address.includes('||ADDR||')) {
      return address.split('||ADDR||')[0].trim();
    }
    
    return address;
  }

  private adaptOrderItems(backendItems: any[]): OrderItem[] {
    console.log('🔍 Raw backend items:', backendItems);

    if (!Array.isArray(backendItems)) {
      console.warn('⚠️ Backend items is not an array:', backendItems);
      return [];
    }

    const adaptedItems = backendItems.map((item, index) => {
      console.log(`🔍 Processing item ${index}:`, item);

      const adaptedItem: OrderItem = {
        id: item.id || index,
        productId: item.productId || item.product_id || 0,
        productName: item.productName || item.product_name || item.name || `Product ${index + 1}`,
        quantity: this.parseQuantity(item.quantity || item.qty || 1),
        pricePerUnit: this.parsePrice(item.pricePerUnit || item.price_per_unit || item.price || item.unitPrice || 0),
        imageUrl: 'assets/default-product.png'
      };

      console.log(`🔍 Adapted item ${index}:`, adaptedItem);
      return adaptedItem;
    });

    console.log('🔍 All adapted items:', adaptedItems);
    return adaptedItems;
  }

  private parsePrice(value: any): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const cleanValue = value.replace(/[$,\s]/g, '');
      const parsed = parseFloat(cleanValue);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  }

  private parseQuantity(value: any): number {
    if (typeof value === 'number') return Math.max(1, Math.floor(value));
    if (typeof value === 'string') {
      const parsed = parseInt(value, 10);
      return isNaN(parsed) ? 1 : Math.max(1, parsed);
    }
    return 1;
  }

  getProductImageUrl(item: OrderItem): string {
    const imageUrl = item.imageUrl || 'assets/default-product.png';
    console.log(`🔍 Image URL for ${item.productName}:`, imageUrl);
    return imageUrl;
  }

  onImageError(event: any): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      console.log('🔍 Image failed to load, using fallback');
      target.src = 'assets/default-product.png';
    }
  }

  getSubtotal(): number {
    if (!this.order?.items) {
      console.log('🔍 No items for subtotal calculation');
      return 0;
    }

    const subtotal = this.order.items.reduce((sum, item) => {
      const itemTotal = (item.quantity || 0) * (item.pricePerUnit || 0);
      console.log(`🔍 Item ${item.productName}: ${item.quantity} x $${item.pricePerUnit} = $${itemTotal}`);
      return sum + itemTotal;
    }, 0);

    console.log(`🔍 Total subtotal: $${subtotal}`);
    return subtotal;
  }

  getItemTotal(item: OrderItem): number {
    const total = (item.quantity || 0) * (item.pricePerUnit || 0);
    console.log(`🔍 Item total for ${item.productName}: ${item.quantity} x $${item.pricePerUnit} = $${total}`);
    return total;
  }

  canDownloadInvoice(): boolean {
    return this.order?.status !== 'CANCELLED' && this.order?.status !== 'PENDING';
  }

  canCancelOrder(): boolean {
    return this.order?.status === 'PENDING';
  }

  cancelOrder(): void {
    if (!this.order) return;
    
    const confirmation = confirm(`¿Estás seguro de que quieres cancelar el pedido #${this.order.id}?`);
    
    if (confirmation) {
      this.loading = true;
      
      this.orderService.cancelOrder(this.order.id).subscribe({
        next: () => {
          if (this.order) {
            this.order.status = 'CANCELLED';
          }
          this.loading = false;
          this.toastService.success('Pedido cancelado exitosamente');
        },
        error: (error) => {
          this.loading = false;
          console.error('Error cancelling order:', error);
          this.toastService.error(error.message || 'Error al cancelar el pedido. Inténtalo de nuevo.');
        }
      });
    }
  }

  downloadInvoice(): void {
    if (this.order) {
      this.orderService.generateReceiptPDF(this.order.id).then(() => {
        console.log('Invoice downloaded successfully');
      }).catch(error => {
        console.error('Error downloading invoice:', error);
        this.toastService.error('Error downloading invoice. Please try again.');
      });
    }
  }

  viewReceipt(): void {
    if (this.order) {
      this.orderService.getReceipt(this.order.id).subscribe({
        next: (response) => {
          const newWindow = window.open('', '_blank');
          if (newWindow) {
            newWindow.document.write(`
              <html>
                <head><title>Comprobante - Pedido #${this.order!.id}</title></head>
                <body>
                  <pre style="font-family: monospace; padding: 20px;">
                    ${response.receipt}
                  </pre>
                </body>
              </html>
            `);
          }
        },
        error: (error) => {
          console.error('Error loading receipt:', error);
          this.toastService.error('Error loading receipt. Please try again.');
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/user/orders']);
  }

  getStatusText(status: string): string {
    const statusTexts: { [key: string]: string } = {
      'PENDING': 'Pending',
      'CONFIRMED': 'Confirmed',
      'PROCESSING': 'Processing',
      'SHIPPED': 'Shipped',
      'DELIVERED': 'Delivered',
      'CANCELLED': 'Cancelled'
    };
    return statusTexts[status?.toUpperCase()] || status || 'Unknown';
  }

  getPaymentMethodText(method: string): string {
    const methodTexts: { [key: string]: string } = {
      'CREDIT_CARD': 'Credit Card',
      'DEBIT_CARD': 'Debit Card',
      'MERCADOPAGO': 'MercadoPago',
      'WHATSAPP': 'WhatsApp Coordination',
      'BANK_TRANSFER': 'Bank Transfer'
    };
    return methodTexts[method?.toUpperCase()] || method || 'Unknown';
  }

  trackByItemId(index: number, item: OrderItem): number {
    return item.id || item.productId || index;
  }
}
