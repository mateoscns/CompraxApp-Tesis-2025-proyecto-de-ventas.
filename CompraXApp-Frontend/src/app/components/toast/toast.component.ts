import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ToastService, Toast } from '../../services/toast.service';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div 
        *ngFor="let toast of toasts" 
        class="toast toast-{{ toast.type }}"
        [@toastAnimation]
        (click)="dismiss(toast.id)">
        
        <div class="toast-icon">
          <span *ngIf="toast.type === 'success'">✓</span>
          <span *ngIf="toast.type === 'error'">✕</span>
          <span *ngIf="toast.type === 'warning'">⚠</span>
          <span *ngIf="toast.type === 'info'">ℹ</span>
        </div>
        
        <div class="toast-content">
          <div class="toast-title">{{ toast.title }}</div>
          <div class="toast-message">{{ toast.message }}</div>
        </div>
        
        <button class="toast-close" (click)="dismiss(toast.id); $event.stopPropagation()">
          ×
        </button>
        
        <div class="toast-progress" [style.animation-duration.ms]="toast.duration"></div>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 24px;
      right: 24px;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-width: 420px;
      width: calc(100% - 48px);
    }

    .toast {
      display: flex;
      align-items: flex-start;
      gap: 14px;
      padding: 16px 18px;
      border-radius: 14px;
      background: white;
      box-shadow: 
        0 10px 40px rgba(0, 0, 0, 0.12),
        0 4px 12px rgba(0, 0, 0, 0.08);
      cursor: pointer;
      position: relative;
      overflow: hidden;
      border-left: 4px solid;
      backdrop-filter: blur(10px);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .toast:hover {
      transform: translateX(-4px);
      box-shadow: 
        0 14px 48px rgba(0, 0, 0, 0.15),
        0 6px 16px rgba(0, 0, 0, 0.1);
    }

    .toast-success {
      border-left-color: #10b981;
      background: linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%);
    }

    .toast-error {
      border-left-color: #ef4444;
      background: linear-gradient(135deg, #ffffff 0%, #fef2f2 100%);
    }

    .toast-warning {
      border-left-color: #f59e0b;
      background: linear-gradient(135deg, #ffffff 0%, #fffbeb 100%);
    }

    .toast-info {
      border-left-color: #3b82f6;
      background: linear-gradient(135deg, #ffffff 0%, #eff6ff 100%);
    }

    .toast-icon {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: 700;
      flex-shrink: 0;
    }

    .toast-success .toast-icon {
      background: linear-gradient(135deg, #10b981, #059669);
      color: white;
    }

    .toast-error .toast-icon {
      background: linear-gradient(135deg, #ef4444, #dc2626);
      color: white;
    }

    .toast-warning .toast-icon {
      background: linear-gradient(135deg, #f59e0b, #d97706);
      color: white;
    }

    .toast-info .toast-icon {
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      color: white;
    }

    .toast-content {
      flex: 1;
      min-width: 0;
    }

    .toast-title {
      font-weight: 700;
      font-size: 0.95rem;
      color: #1f2937;
      margin-bottom: 4px;
      letter-spacing: -0.01em;
    }

    .toast-message {
      font-size: 0.875rem;
      color: #6b7280;
      line-height: 1.5;
      word-wrap: break-word;
    }

    .toast-close {
      position: absolute;
      top: 10px;
      right: 10px;
      width: 24px;
      height: 24px;
      border: none;
      background: rgba(0, 0, 0, 0.05);
      color: #9ca3af;
      border-radius: 6px;
      cursor: pointer;
      font-size: 16px;
      line-height: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      opacity: 0;
    }

    .toast:hover .toast-close {
      opacity: 1;
    }

    .toast-close:hover {
      background: rgba(0, 0, 0, 0.1);
      color: #374151;
    }

    .toast-progress {
      position: absolute;
      bottom: 0;
      left: 0;
      height: 3px;
      background: currentColor;
      opacity: 0.3;
      animation: progress linear forwards;
    }

    .toast-success .toast-progress { color: #10b981; }
    .toast-error .toast-progress { color: #ef4444; }
    .toast-warning .toast-progress { color: #f59e0b; }
    .toast-info .toast-progress { color: #3b82f6; }

    @keyframes progress {
      from { width: 100%; }
      to { width: 0%; }
    }

    @media (max-width: 480px) {
      .toast-container {
        top: 16px;
        right: 16px;
        left: 16px;
        width: auto;
        max-width: none;
      }

      .toast {
        padding: 14px 16px;
      }

      .toast-icon {
        width: 28px;
        height: 28px;
        font-size: 12px;
      }

      .toast-title {
        font-size: 0.9rem;
      }

      .toast-message {
        font-size: 0.8rem;
      }
    }
  `],
  animations: [
    trigger('toastAnimation', [
      transition(':enter', [
        style({ 
          transform: 'translateX(100%)', 
          opacity: 0 
        }),
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', style({ 
          transform: 'translateX(0)', 
          opacity: 1 
        }))
      ]),
      transition(':leave', [
        animate('200ms cubic-bezier(0.4, 0, 0.2, 1)', style({ 
          transform: 'translateX(100%)', 
          opacity: 0 
        }))
      ])
    ])
  ]
})
export class ToastComponent implements OnInit, OnDestroy {
  toasts: Toast[] = [];
  private subscription!: Subscription;

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.subscription = this.toastService.toasts$.subscribe(
      toasts => this.toasts = toasts
    );
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  dismiss(id: number): void {
    this.toastService.dismiss(id);
  }
}
