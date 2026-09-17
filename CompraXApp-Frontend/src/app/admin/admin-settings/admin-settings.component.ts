import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-settings.component.html',
  styleUrl: './admin-settings.component.css'
})
export class AdminSettingsComponent implements OnInit {
  settingsForm: FormGroup;
  isLoading = false;
  isSaving = false;
  successMessage = '';
  errorMessage = '';

  constructor(private fb: FormBuilder) {
    this.settingsForm = this.fb.group({
      siteName: ['CompraXApp', Validators.required],
      siteDescription: ['Your trusted e-commerce platform', Validators.required],
      contactEmail: ['admin@compraxapp.com', [Validators.required, Validators.email]],
      supportPhone: ['+54 351 309 1448', Validators.required],
      currency: ['USD', Validators.required],
      taxRate: [21, [Validators.required, Validators.min(0), Validators.max(100)]],
      shippingCost: [5.99, [Validators.required, Validators.min(0)]],
      lowStockThreshold: [10, [Validators.required, Validators.min(1)]],
      maintenanceMode: [false],
      emailNotifications: [true],
      smsNotifications: [false]
    });
  }

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    this.isLoading = true;
    // Simular carga de configuraciones desde el backend
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }

  onSubmit(): void {
    if (this.settingsForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isSaving = true;
    this.successMessage = '';
    this.errorMessage = '';

    // Simular guardado
    setTimeout(() => {
      this.successMessage = 'Settings saved successfully!';
      this.isSaving = false;
      
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => {
        this.successMessage = '';
      }, 3000);
    }, 1500);
  }

  resetToDefaults(): void {
    if (confirm('Are you sure you want to reset all settings to defaults? This action cannot be undone.')) {
      this.settingsForm.patchValue({
        siteName: 'CompraXApp',
        siteDescription: 'Your trusted e-commerce platform',
        contactEmail: 'admin@compraxapp.com',
        supportPhone: '+54 351 309 1448',
        currency: 'USD',
        taxRate: 21,
        shippingCost: 5.99,
        lowStockThreshold: 10,
        maintenanceMode: false,
        emailNotifications: true,
        smsNotifications: false
      });
      
      this.successMessage = 'Settings reset to defaults!';
      setTimeout(() => {
        this.successMessage = '';
      }, 3000);
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.settingsForm.controls).forEach(key => {
      this.settingsForm.get(key)?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.settingsForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.settingsForm.get(fieldName);
    if (field?.errors?.['required']) return 'This field is required';
    if (field?.errors?.['email']) return 'Please enter a valid email address';
    if (field?.errors?.['min']) return `Minimum value is ${field.errors?.['min'].min}`;
    if (field?.errors?.['max']) return `Maximum value is ${field.errors?.['max'].max}`;
    return '';
  }
}
