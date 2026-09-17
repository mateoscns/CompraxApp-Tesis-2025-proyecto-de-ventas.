import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  errorMessage = '';
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: [''],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loading) return;

    this.errorMessage = '';
    this.registerForm.markAllAsTouched();
    
    if (this.registerForm.valid) {
      this.loading = true;

      const formValue = this.registerForm.value;
      const signupData = {
        name: `${formValue.firstName} ${formValue.lastName || ''}`.trim(),
        email: formValue.email,
        password: formValue.password,
      };

      this.authService.register(signupData).subscribe({
        next: (response) => {
          this.loading = false;
          this.toastService.success('¡Registro exitoso! Revisa tu correo para verificar tu cuenta.');
          this.router.navigate(['/auth/verify-account'], { 
            queryParams: { email: signupData.email } 
          });
        },
        error: (err: HttpErrorResponse) => {
          this.loading = false;
          
          if (err.status === 409) {
            this.errorMessage = 'Este correo electrónico ya está registrado.';
          } else if (err.error?.message) {
            this.errorMessage = err.error.message;
          } else {
            this.errorMessage = 'Error en el registro. Por favor, inténtalo de nuevo.';
          }
        }
      });
    } else {
      this.errorMessage = 'Por favor, completa todos los campos requeridos correctamente.';
    }
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.registerForm.get(fieldName);
    if (field?.errors?.['required']) return `Este campo es requerido`;
    if (field?.errors?.['email']) return 'Ingresa un email válido';
    if (field?.errors?.['minlength']) {
      const minLength = field.errors?.['minlength'].requiredLength;
      return `Mínimo ${minLength} caracteres`;
    }
    return '';
  }
}