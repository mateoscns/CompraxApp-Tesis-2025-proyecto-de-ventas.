import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../order.service';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-confirmation.component.html',
  styleUrls: ['./order-confirmation.component.css']
})
export class OrderConfirmationComponent implements OnInit {
  orderId: string = '';
  order: any = null;
  loading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    this.orderId = this.route.snapshot.params['id'];
    this.loadOrderDetails();
  }

  loadOrderDetails(): void {
    if (this.orderId) {
      this.orderService.getOrderById(+this.orderId).subscribe({
        next: (order) => {
          this.order = order;
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Error loading order details';
          this.loading = false;
          console.error('Error loading order:', error);
        }
      });
    } else {
      this.loading = false;
    }
  }

  goToOrders(): void {
    this.router.navigate(['/user/orders']);
  }

  goToHome(): void {
    this.router.navigate(['/products']);
  }
}
