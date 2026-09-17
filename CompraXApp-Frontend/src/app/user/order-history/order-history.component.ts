import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { OrderService, OrderDTO } from '../../order/order.service';
import { AuthService } from '../../auth/auth.service';
import { UserService, UserProfileResponse, UserUpdateRequest } from '../user.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.css']
})
export class OrderHistoryComponent implements OnInit {
  orders: OrderDTO[] = [];
  loading = true;
  error = '';
  currentPage = 1;
  totalPages = 1;
  pageSize = 10;

  userProfile: UserProfileResponse | null = null;
  isEditing = false;
  isLoading = true;
  isSaving = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private orderService: OrderService,
    private userService: UserService,
    private authService: AuthService,
    public router: Router,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/auth/login']);
      return;
    }
    this.loadOrders();
    this.loadUserProfile();
  }

  loadOrders(page: number = 1): void {
    this.loading = true;
    this.orderService.getUserOrders().subscribe({
      next: (orders: OrderDTO[]) => {
        console.log('🔍 Raw orders from backend:', orders);
        
       
        if (orders.length > 0) {
          console.log('🔍 First order structure:', orders[0]);
          if (orders[0].items && orders[0].items.length > 0) {
            console.log('🔍 First item structure:', orders[0].items[0]);
            console.log('🔍 All fields in first item:', Object.keys(orders[0].items[0]));
          }
        }
        
        this.orders = this.processOrders(orders);
        console.log('🔍 Processed orders:', this.orders);
        
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error loading order history';
        this.loading = false;
        console.error('Error loading orders:', error);
      }
    });
  }


  trackByOrderId(index: number, order: OrderDTO): number {
    return order.id;
  }

  trackByItemId(index: number, item: any): number {
    return item.id || index;
  }

  private processOrders(orders: OrderDTO[]): OrderDTO[] {
    console.log('🔍 Processing orders:', orders);
    
    return orders.map(order => {
      console.log(`🔍 Processing order ${order.id}:`, order);
      
      const processedItems = (order.items || []).map((item, index) => {
        console.log(`🔍 Raw item data:`, item);
        
        const itemData = item as any;
        
        const possiblePriceFields = [
          'pricePerUnit', 'price_per_unit', 'unitPrice', 'unit_price', 
          'price', 'cost', 'amount', 'productPrice', 'product_price'
        ];
        
        let foundPrice = 0;
        for (const field of possiblePriceFields) {
          const value = itemData[field];
          if (value !== null && value !== undefined && value !== '' && !isNaN(Number(value))) {
            foundPrice = this.parsePrice(value);
            if (foundPrice > 0) {
              console.log(`🔍 Found valid price in field '${field}': ${value} -> ${foundPrice}`);
              break;
            }
          }
        }
        
        if (foundPrice === 0 && order.totalAmount && order.items?.length) {
          const orderTotal = this.parsePrice(order.totalAmount);
          if (orderTotal > 0) {
            foundPrice = orderTotal / order.items.length;
            console.log(`🔍 Calculated price from order total: ${orderTotal} / ${order.items.length} = ${foundPrice}`);
          }
        }
        
        const possibleQuantityFields = ['quantity', 'qty', 'count', 'units'];
        let foundQuantity = 1;
        
        for (const field of possibleQuantityFields) {
          const value = itemData[field];
          if (value !== null && value !== undefined && value !== '' && !isNaN(Number(value))) {
            foundQuantity = this.parseQuantity(value);
            if (foundQuantity > 0) {
              console.log(`🔍 Found valid quantity in field '${field}': ${value} -> ${foundQuantity}`);
              break;
            }
          }
        }
        
        const processedItem = {
          id: item.id || index,
          productId: item.productId || 0,
          productName: item.productName || `Product ${index + 1}`,
          quantity: foundQuantity,
          pricePerUnit: foundPrice,
          originalData: itemData
        };
        
        console.log(`🔍 Processed item:`, processedItem);
        return processedItem;
      });
      
      const processedOrder = {
        ...order,
        items: processedItems,
        totalAmount: this.parsePrice(order.totalAmount),
        shippingStatus: order.shippingStatus || order.status || 'PENDING'
      };
      
      console.log(`🔍 Final processed order:`, processedOrder);
      return processedOrder;
    });
  }

  public getStatusText(status: string): string {
    const statusTexts: { [key: string]: string } = {
      'PENDING': 'Pending',
      'PROCESSING': 'Processing', 
      'SHIPPED': 'Shipped',
      'DELIVERED': 'Delivered',
      'CANCELLED': 'Cancelled'
    };
    return statusTexts[status] || status;
  }

  public getItemQuantity(item: any): number {
    return item.quantity || 1;
  }

  public getItemPrice(item: any): number {
    return item.pricePerUnit || item.price || 0;
  }

  public parsePrice(value: any): number {
    console.log(`🔍 Parsing price:`, value, `(type: ${typeof value})`);
    
    if (value === null || value === undefined || value === '') {
      console.log(`🔍 Null/undefined/empty price, returning 0`);
      return 0;
    }
    
    if (typeof value === 'number' && !isNaN(value) && isFinite(value)) {
      const result = Math.max(0, value);
      console.log(`🔍 Valid number price: ${result}`);
      return result;
    }
    
    if (typeof value === 'string') {
      const cleanValue = value.trim().replace(/[$,\s€£¥]/g, '');
      if (cleanValue === '') {
        console.log(`🔍 Empty string after cleaning: returning 0`);
        return 0;
      }
      
      const parsed = parseFloat(cleanValue);
      const result = isNaN(parsed) ? 0 : Math.max(0, parsed);
      console.log(`🔍 String to number: "${value}" -> "${cleanValue}" -> ${result}`);
      return result;
    }
    
    console.log(`🔍 Fallback to 0 for value:`, value);
    return 0;
  }

  public parseQuantity(value: any): number {
    console.log(`🔍 Parsing quantity:`, value, `(type: ${typeof value})`);
    
    if (typeof value === 'number' && !isNaN(value) && isFinite(value)) {
      return Math.max(1, Math.floor(value));
    }
    
    if (typeof value === 'string') {
      const parsed = parseInt(value, 10);
      const result = isNaN(parsed) ? 1 : Math.max(1, parsed);
      console.log(`🔍 String to quantity: "${value}" -> ${result}`);
      return result;
    }
    
    console.log(`🔍 Fallback to 1 for quantity:`, value);
    return 1;
  }

 


  getItemTotal(item: any): number {
    const price = this.getItemPrice(item);
    const quantity = this.getItemQuantity(item);
    const total = price * quantity;
    
    console.log(`🔍 Total calculation for ${item.productName}:`);
    console.log(`   - Price: ${price}`);
    console.log(`   - Quantity: ${quantity}`);
    console.log(`   - Total: ${total}`);
    
    return total;
  }

 

  private findPriceInObject(obj: any): number {
    const priceFields = [
      'pricePerUnit', 'price_per_unit', 'unitPrice', 'unit_price',
      'price', 'cost', 'amount', 'value', 'productPrice', 'product_price'
    ];
    
    for (const field of priceFields) {
      if (obj[field] !== null && obj[field] !== undefined) {
        const parsed = this.parsePrice(obj[field]);
        if (parsed > 0) {
          console.log(`🔍 Found price in field '${field}': ${parsed}`);
          return parsed;
        }
      }
    }
    
    return 0;
  }

  private getEstimatedPrice(item: any): number {
    const parentOrder = this.orders.find(order => 
      order.items?.some(orderItem => 
        orderItem.id === item.id || orderItem.productId === item.productId
      )
    );
    
    if (parentOrder && parentOrder.totalAmount && parentOrder.items?.length) {
      const estimatedPrice = parentOrder.totalAmount / parentOrder.items.length;
      console.log(`🔍 Estimated price based on order total: ${estimatedPrice}`);
      return estimatedPrice;
    }
    
    console.log(`🔍 Using fallback price: 0`);
    return 0;
  }

  loadUserProfile(): void {
    this.isLoading = true;
    this.userService.getMyProfile().subscribe({
      next: (profile: UserProfileResponse) => {
        this.userProfile = profile;
        this.isLoading = false;
      },
      error: (err: any) => {
        this.errorMessage = 'Error loading profile';
        this.isLoading = false;
        console.error('Error loading profile:', err);
      }
    });
  }

  getStatusColor(status: string): string {
    const statusColors: { [key: string]: string } = {
      'PENDING': 'warning',
      'PROCESSING': 'info',
      'SHIPPED': 'primary',
      'DELIVERED': 'success',
      'CANCELLED': 'danger'
    };
    return statusColors[status] || 'secondary';
  }

 

  getShippingStatusText(shippingStatus: string): string {
    if (!shippingStatus) return 'Pending';
    
    const shippingTexts: { [key: string]: string } = {
      'PENDING': 'Pending',
      'PROCESSING': 'Preparing',
      'SHIPPED': 'In Transit',
      'DELIVERED': 'Delivered',
      'CANCELLED': 'Cancelled'
    };
    return shippingTexts[shippingStatus] || shippingStatus;
  }

  viewOrderDetails(orderId: number): void {
    this.router.navigate(['/order/details', orderId]);
  }

  reorderItems(order: OrderDTO): void {
    console.log('Reordering items from order:', order.id);
    this.toastService.info('Reorder functionality will be implemented soon');
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.loadOrders(this.currentPage + 1);
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.loadOrders(this.currentPage - 1);
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.loadOrders(page);
    }
  }

  

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

 

  private findQuantityInObject(obj: any): number {
    const quantityFields = [
      'quantity', 'qty', 'count', 'amount', 'units'
    ];
    
    for (const field of quantityFields) {
      if (obj[field] !== null && obj[field] !== undefined) {
        const parsed = this.parseQuantity(obj[field]);
        if (parsed > 0) {
          console.log(`🔍 Found quantity in field '${field}': ${parsed}`);
          return parsed;
        }
      }
    }
    
    return 1;
  }



  downloadReceipt(orderId: number): void {
    this.loading = true;
    this.errorMessage = '';
    
    this.orderService.generateReceiptPDF(orderId).then(() => {
      this.loading = false;
      this.successMessage = 'Receipt downloaded successfully!';
      setTimeout(() => this.successMessage = '', 3000);
    }).catch(error => {
      this.loading = false;
      console.error('Error downloading PDF receipt:', error);
      this.errorMessage = 'Error downloading receipt. Please try again.';
      setTimeout(() => this.errorMessage = '', 5000);
    });
  }

  

  async viewReceipt(orderId: number): Promise<void> {
    try {
      this.loading = true;
      const response = await this.orderService.getReceipt(orderId).toPromise();
      const orderDetails = await this.orderService.getOrderById(orderId).toPromise();
      
      if (response && orderDetails) {
        this.showReceiptModal(response.receipt, orderDetails);
      }
    } catch (error) {
      console.error('Error loading receipt:', error);
      this.errorMessage = 'Error loading receipt.';
    } finally {
      this.loading = false;
    }
  }

  private showReceiptModal(receiptContent: string, order: OrderDTO): void {
    const modal = document.createElement('div');
    modal.className = 'receipt-modal';
    
    const componentInstance = this;
    
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>📄 Receipt - Order #${order.id}</h3>
          <button class="close-btn" onclick="this.closest('.receipt-modal').remove()">×</button>
        </div>
        <div class="modal-body">
          <div class="receipt-preview">
            ${this.generateHTMLReceipt(order)}
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-download" id="download-btn-${order.id}">
            📥 Download PDF
          </button>
          <button class="btn-print" onclick="window.print()">
            🖨️ Print
          </button>
          <button class="btn-close" onclick="this.closest('.receipt-modal').remove()">
            Close
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    const downloadBtn = document.getElementById(`download-btn-${order.id}`);
    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => {
        componentInstance.downloadReceipt(order.id);
      });
    }
  }

  private generateHTMLReceipt(order: OrderDTO): string {
    const orderDate = new Date(order.orderDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    let itemsHTML = '';
    let total = 0;

    if (order.items && order.items.length > 0) {
      order.items.forEach((item: any) => {
        const quantity = this.getItemQuantity(item);
        const price = this.getItemPrice(item);
        const subtotal = quantity * price;
        total += subtotal;

        itemsHTML += `
          <tr>
            <td>${item.productName}</td>
            <td class="text-center">${quantity}</td>
            <td class="text-right">$${price.toFixed(2)}</td>
            <td class="text-right">$${subtotal.toFixed(2)}</td>
          </tr>
        `;
      });
    }

    return `
      <div class="receipt-header">
        <h2>PURCHASE RECEIPT</h2>
        <h3>CompraXApp</h3>
      </div>
      
      <div class="receipt-info">
        <div class="info-row">
          <span class="label">Order #:</span>
          <span class="value">${order.id}</span>
        </div>
        <div class="info-row">
          <span class="label">Date:</span>
          <span class="value">${orderDate}</span>
        </div>
        <div class="info-row">
          <span class="label">Status:</span>
          <span class="value status-${order.status.toLowerCase()}">${this.getStatusText(order.status)}</span>
        </div>
        <div class="info-row">
          <span class="label">Customer:</span>
          <span class="value">${order.userName || 'User'}</span>
        </div>
        ${order.shippingAddress ? `
        <div class="info-row">
          <span class="label">Address:</span>
          <span class="value">${order.shippingAddress}</span>
        </div>
        ` : ''}
      </div>

      <div class="receipt-items">
        <h4>Products:</h4>
        <table class="items-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
        </table>
      </div>

      <div class="receipt-total">
        <div class="total-row">
          <span class="total-label">TOTAL:</span>
          <span class="total-value">$${(order.totalAmount || total).toFixed(2)}</span>
        </div>
      </div>

      <div class="receipt-footer">
        <p>Thank you for your purchase!</p>
        <p class="generated-date">Generated on: ${new Date().toLocaleString('en-US')}</p>
      </div>
    `;
  }

}
