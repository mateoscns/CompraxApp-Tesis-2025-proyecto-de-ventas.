import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, VerificationRequest } from '../auth.service';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-verify-account',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './verify-account.component.html',
  styleUrls: ['./verify-account.component.css']
})
export class VerifyAccountComponent implements OnInit, OnDestroy {
  verifyForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  userEmail = '';
  
  timeRemaining = 15 * 60;
  timerInterval: any;
  
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {
    this.verifyForm = this.fb.group({
      email: [{value: '', disabled: true}, [Validators.required, Validators.email]],
      code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.userEmail = params['email'];
      if (this.userEmail) {
        this.verifyForm.patchValue({ email: this.userEmail });
      } else {
        this.verifyForm.get('email')?.enable();
      }
    });
    
    this.startTimer();
  }
  
  startTimer(): void {
    this.timerInterval = setInterval(() => {
      this.timeRemaining--;
      if (this.timeRemaining <= 0) {
        clearInterval(this.timerInterval);
        this.errorMessage = 'El código de verificación ha expirado. Por favor, solicita uno nuevo.';
      }
    }, 1000);
  }
  
  getFormattedTime(): string {
    const minutes = Math.floor(this.timeRemaining / 60);
    const seconds = this.timeRemaining % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
  
  resendCode(): void {
    if (!this.userEmail) return;
    
    this.isLoading = true;
    this.errorMessage = '';
    
    setTimeout(() => {
      this.isLoading = false;
      this.successMessage = 'Nuevo código enviado a tu correo electrónico.';
      this.timeRemaining = 15 * 60;
      this.startTimer();
    }, 2000);
  }

  onSubmit(): void {
    if (this.verifyForm.invalid) {
      this.errorMessage = 'Por favor, ingresa un código de verificación válido.';
      this.verifyForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const verificationData: VerificationRequest = {
      email: this.verifyForm.getRawValue().email,
      code: this.verifyForm.value.code
    };

    this.authService.verify(verificationData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = response.message + " Redirigiendo al login...";
        clearInterval(this.timerInterval);
        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 3000);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Error al verificar la cuenta. Inténtalo de nuevo.';
        console.error('Error en la verificación', err);
      }
    });
  }
  
  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }
}
