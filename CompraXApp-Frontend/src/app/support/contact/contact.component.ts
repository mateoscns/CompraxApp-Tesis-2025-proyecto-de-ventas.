import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css'
})
export class ContactComponent {
  contactForm: FormGroup;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  contactMethods = [
    {
      icon: '📧',
      title: 'Email Support',
      description: 'Get help via email within 24 hours',
      contact: 'compraxapp@gmail.com',
      link: 'mailto:compraxapp@gmail.com'
    },
    {
      icon: '📞',
      title: 'Phone Support',
      description: 'Speak directly with our support team',
      contact: '+54 351 309 1448',
      link: 'tel:+5435130914481'
    },
    {
      icon: '💬',
      title: 'Live Chat',
      description: 'Chat with us in real-time',
      contact: 'Available 9 AM - 6 PM',
      link: '#'
    },
    {
      icon: '📍',
      title: 'Visit Us',
      description: 'Come to our office location',
      contact: 'Córdoba, Argentina',
      link: 'https://maps.google.com'
    }
  ];

  faqItems = [
    {
      question: 'How long does shipping take?',
      answer: 'Standard shipping takes 5-7 business days, while express shipping takes 2-3 business days.'
    },
    {
      question: 'What is your return policy?',
      answer: 'You can return items within 30 days of delivery in original condition for a full refund.'
    },
    {
      question: 'How can I track my order?',
      answer: 'You can track your order by logging into your account and visiting the Order History section.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, debit cards, and payments through MercadoPago.'
    }
  ];

  constructor(private fb: FormBuilder, private toastService: ToastService) {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', [Validators.required, Validators.minLength(5)]],
      category: ['general', Validators.required],
      message: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]],
      priority: ['normal'],
      newsletter: [false]
    });
  }

  onSubmit(): void {
    if (this.contactForm.invalid) {
      this.markFormGroupTouched();
      this.errorMessage = 'Please fill in all required fields correctly.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    setTimeout(() => {
      this.isSubmitting = false;
      this.successMessage = '✅ Thank you! Your message has been sent successfully. We\'ll get back to you within 24 hours.';
      this.contactForm.reset();
      this.contactForm.patchValue({
        category: 'general',
        priority: 'normal',
        newsletter: false
      });
    }, 2000);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.contactForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.contactForm.get(fieldName);
    if (field?.errors?.['required']) return 'This field is required';
    if (field?.errors?.['email']) return 'Please enter a valid email address';
    if (field?.errors?.['minlength']) {
      const minLength = field.errors?.['minlength'].requiredLength;
      return `Minimum ${minLength} characters required`;
    }
    if (field?.errors?.['maxlength']) {
      const maxLength = field.errors?.['maxlength'].requiredLength;
      return `Maximum ${maxLength} characters allowed`;
    }
    return '';
  }

  private markFormGroupTouched(): void {
    Object.keys(this.contactForm.controls).forEach(key => {
      const control = this.contactForm.get(key);
      control?.markAsTouched();
    });
  }

  openLiveChat(): void {
    this.toastService.info('Live chat feature coming soon!');
  }
}