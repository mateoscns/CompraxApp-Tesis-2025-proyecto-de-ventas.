import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  emailForm: FormGroup;
  resetForm: FormGroup;
  
  currentStep = 1;
  isLoading = false;
  successMessage = '';
  errorMessage = '';
  userEmail = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    this.resetForm = this.fb.group({
      code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ mismatch: true });
      return { mismatch: true };
    }
    return null;
  }

  onRequestCode(): void {
    if (this.emailForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.userEmail = this.emailForm.get('email')?.value;

    this.authService.requestPasswordReset(this.userEmail).subscribe({
      next: () => {
        this.isLoading = false;
        this.currentStep = 2;
        this.successMessage = 'Te enviamos un código de 6 dígitos a tu email.';
      },
      error: () => {
        this.isLoading = false;
        this.currentStep = 2;
        this.successMessage = 'Si el email existe, recibirás un código de 6 dígitos.';
      }
    });
  }

  onResetPassword(): void {
    if (this.resetForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const code = this.resetForm.get('code')?.value;
    const newPassword = this.resetForm.get('password')?.value;

    this.authService.resetPassword(this.userEmail, code, newPassword).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = '¡Contraseña actualizada! Redirigiendo al login...';
        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 2000);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.message || 'Código inválido o expirado';
      }
    });
  }

  goBack(): void {
    this.currentStep = 1;
    this.errorMessage = '';
    this.successMessage = '';
    this.resetForm.reset();
  }
}
