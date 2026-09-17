import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService, PromotionDTO, PromotionCreateRequest } from '../admin.service';


@Component({
  selector: 'app-admin-promotions',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './admin-promotions.component.html',
  styleUrls: ['./admin-promotions.component.css']
})
export class AdminPromotionsComponent implements OnInit {
  promotions: PromotionDTO[] = [];
  selectedPromotion: PromotionDTO | null = null;
  isLoading = false;
  isCreating = false;
  isEditing = false;
  
  promotionForm!: FormGroup;
  
  successMessage = '';
  errorMessage = '';

  constructor(
    private adminService: AdminService,
    private fb: FormBuilder
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadPromotions();
  }

  initializeForm(): void {
    this.promotionForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.maxLength(500)]],
      discountPercentage: ['', [Validators.required, Validators.min(0.01), Validators.max(100)]],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      active: [true]
    });
  }


  trackByPromotionId(index: number, promotion: PromotionDTO): number {
    return promotion.id;
  }

  loadPromotions(): void {
    this.isLoading = true;
    this.clearMessages();
    
    this.adminService.getAllPromotions().subscribe({
      next: (promotions) => {
        this.promotions = promotions;
        this.isLoading = false;
        console.log('✅ Promotions loaded:', promotions);
      },
      error: (error) => {
        console.error('❌ Error loading promotions:', error);
        this.errorMessage = 'Error loading promotions';
        this.isLoading = false;
      }
    });
  }

  createPromotion(): void {
    if (this.promotionForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isCreating = true;
    this.clearMessages();

    const promotionData: PromotionCreateRequest = {
      ...this.promotionForm.value,
      startDate: new Date(this.promotionForm.value.startDate).toISOString(),
      endDate: new Date(this.promotionForm.value.endDate).toISOString()
    };

    this.adminService.createPromotion(promotionData).subscribe({
      next: (createdPromotion) => {
        this.promotions.unshift(createdPromotion);
        this.successMessage = 'Promotion created successfully';
        this.resetForm();
        this.isCreating = false;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        console.error('❌ Error creating promotion:', error);
        this.errorMessage = 'Error creating promotion';
        this.isCreating = false;
        setTimeout(() => this.errorMessage = '', 5000);
      }
    });
  }

  editPromotion(promotion: PromotionDTO): void {
    this.selectedPromotion = promotion;
    this.isEditing = true;
    
    this.promotionForm.patchValue({
      title: promotion.title,
      description: promotion.description,
      discountPercentage: promotion.discountPercentage,
      startDate: new Date(promotion.startDate).toISOString().slice(0, 16),
      endDate: new Date(promotion.endDate).toISOString().slice(0, 16),
      active: promotion.active
    });
  }

  updatePromotion(): void {
    if (!this.selectedPromotion || this.promotionForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isCreating = true;
    this.clearMessages();

    const promotionData: PromotionCreateRequest = {
      ...this.promotionForm.value,
      startDate: new Date(this.promotionForm.value.startDate).toISOString(),
      endDate: new Date(this.promotionForm.value.endDate).toISOString()
    };

    this.adminService.updatePromotion(this.selectedPromotion.id, promotionData).subscribe({
      next: (updatedPromotion) => {
        const index = this.promotions.findIndex(p => p.id === updatedPromotion.id);
        if (index !== -1) {
          this.promotions[index] = updatedPromotion;
        }
        this.successMessage = 'Promotion updated successfully';
        this.cancelEdit();
        this.isCreating = false;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        console.error('❌ Error updating promotion:', error);
        this.errorMessage = 'Error updating promotion';
        this.isCreating = false;
        setTimeout(() => this.errorMessage = '', 5000);
      }
    });
  }

  deletePromotion(promotion: PromotionDTO): void {
    if (!confirm(`Are you sure you want to delete the promotion "${promotion.title}"?`)) {
      return;
    }

    this.clearMessages();
    
    this.adminService.deletePromotion(promotion.id).subscribe({
      next: (response) => {
        this.promotions = this.promotions.filter(p => p.id !== promotion.id);
        this.successMessage = 'Promotion deleted successfully';
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        console.error('❌ Error deleting promotion:', error);
        this.errorMessage = 'Error deleting promotion';
        setTimeout(() => this.errorMessage = '', 5000);
      }
    });
  }

  togglePromotionStatus(promotion: PromotionDTO): void {
    this.clearMessages();
    
    this.adminService.togglePromotionStatus(promotion.id).subscribe({
      next: (updatedPromotion) => {
        const index = this.promotions.findIndex(p => p.id === updatedPromotion.id);
        if (index !== -1) {
          this.promotions[index] = updatedPromotion;
        }
        this.successMessage = `Promotion ${updatedPromotion.active ? 'activated' : 'deactivated'} successfully`;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        console.error('❌ Error toggling promotion status:', error);
        this.errorMessage = 'Error changing promotion status';
        setTimeout(() => this.errorMessage = '', 5000);
      }
    });
  }

  sendPromotionToUsers(promotion: PromotionDTO): void {
    if (!confirm(`Send promotion "${promotion.title}" to all users?`)) {
      return;
    }

    this.clearMessages();
    
    this.adminService.sendPromotionToAllUsers(promotion.id).subscribe({
      next: (response) => {
        this.successMessage = 'Promotion sent to all users successfully';
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        console.error('❌ Error sending promotion:', error);
        this.errorMessage = 'Error sending promotion';
        setTimeout(() => this.errorMessage = '', 5000);
      }
    });
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.selectedPromotion = null;
    this.resetForm();
  }

  resetForm(): void {
    this.promotionForm.reset();
    this.promotionForm.patchValue({ active: true });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.promotionForm.controls).forEach(key => {
      this.promotionForm.get(key)?.markAsTouched();
    });
  }

  private clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }

  isPromotionActive(promotion: PromotionDTO): boolean {
    const now = new Date();
    const startDate = new Date(promotion.startDate);
    const endDate = new Date(promotion.endDate);
    return promotion.active && now >= startDate && now <= endDate;
  }

  isPromotionExpired(promotion: PromotionDTO): boolean {
    const now = new Date();
    const endDate = new Date(promotion.endDate);
    return now > endDate;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
