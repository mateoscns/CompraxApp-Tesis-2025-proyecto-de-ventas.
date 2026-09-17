import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from '../admin.service';
import { AuthService } from '../../auth/auth.service';
import { ProductService } from '../../product/product.service';
import { Product } from '../../models/Product';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.css'
})
export class ProductFormComponent implements OnInit {
  productForm: FormGroup;
  isEditMode = false;
  productId: number | null = null;
  isLoading = false;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  currentProduct: Product | null = null;

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private productService: ProductService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      price: ['', [Validators.required, Validators.min(0.01)]],
      stockQuantity: ['', [Validators.required, Validators.min(0)]],
      active: [true],
      imageUrl: ['']
    });
  }

  ngOnInit(): void {
    if (!this.authService.isAdmin()) {
      this.router.navigate(['/products']);
      return;
    }

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.productId = Number(id);
      this.loadProduct();
    }
  }

  loadProduct(): void {
    if (!this.productId) return;
    
    this.isLoading = true;
    this.errorMessage = '';
    
    console.log('Loading product with ID:', this.productId);
    
    this.productService.getProductById(this.productId).subscribe({
      next: (product) => {
        console.log('Product loaded:', product);
        this.currentProduct = product;
        
        this.productForm.patchValue({
          name: product.name || '',
          description: product.description || '',
          price: product.price || 0,
          stockQuantity: product.stockQuantity || 0,
          active: product.active !== undefined ? product.active : true,
          imageUrl: product.imageUrl || ''
        });
        
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading product:', err);
        this.errorMessage = 'Failed to load product. Please try again.';
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      this.markFormGroupTouched();
      this.errorMessage = 'Please fill in all required fields correctly.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formValue = this.productForm.value;
    const productRequest = {
      name: formValue.name.trim(),
      description: formValue.description.trim(),
      price: Number(formValue.price),
      stockQuantity: Number(formValue.stockQuantity),
      active: Boolean(formValue.active),
      imageUrl: formValue.imageUrl ? formValue.imageUrl.trim() : null
    };

    console.log('Sending product data:', productRequest);

    const operation = this.isEditMode 
      ? this.adminService.updateProductJSON(this.productId!, productRequest)
      : this.adminService.createProductJSON(productRequest);

    operation.subscribe({
      next: (product) => {
        console.log('Product saved successfully:', product);
        this.successMessage = `Product ${this.isEditMode ? 'updated' : 'created'} successfully!`;
        this.isSubmitting = false;
        
        setTimeout(() => {
          this.router.navigate(['/admin/products']);
        }, 1500);
      },
      error: (err) => {
        console.error('Error saving product:', err);
        this.isSubmitting = false;
        
        if (err.status === 400 && err.error?.details) {
          this.errorMessage = 'Validation errors: ' + Object.values(err.error.details).join(', ');
        } else {
          this.errorMessage = err.error?.message || `Failed to ${this.isEditMode ? 'update' : 'create'} product. Please try again.`;
        }
      }
    });
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.style.display = 'none';
      console.warn('Failed to load image preview');
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.productForm.controls).forEach(key => {
      this.productForm.get(key)?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.productForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.productForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['minlength']) return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
      if (field.errors['maxlength']) return `${fieldName} must not exceed ${field.errors['maxlength'].requiredLength} characters`;
      if (field.errors['min']) return `${fieldName} must be greater than ${field.errors['min'].min}`;
    }
    return '';
  }

  cancel(): void {
    this.router.navigate(['/admin/products']);
  }
}
