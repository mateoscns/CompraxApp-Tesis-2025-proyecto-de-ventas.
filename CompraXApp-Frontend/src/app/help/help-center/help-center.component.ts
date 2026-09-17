import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-help-center',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './help-center.component.html',
  styleUrl: './help-center.component.css'
})
export class HelpCenterComponent {
  searchQuery = '';
  selectedCategory = '';
  
  categories = [
    { id: 'account', name: 'Account & Profile', icon: '👤', count: 12 },
    { id: 'orders', name: 'Orders & Shipping', icon: '📦', count: 15 },
    { id: 'payments', name: 'Payments & Billing', icon: '💳', count: 8 },
    { id: 'returns', name: 'Returns & Refunds', icon: '🔄', count: 10 },
    { id: 'technical', name: 'Technical Issues', icon: '🛠️', count: 6 },
    { id: 'security', name: 'Security & Privacy', icon: '🔒', count: 7 }
  ];

  faqItems = [
    {
      category: 'account',
      question: 'How do I create a new account?',
      answer: 'Click on "Sign Up" in the top right corner and fill in your details. You\'ll receive a verification email to activate your account.',
      popular: true
    },
    {
      category: 'account',
      question: 'I forgot my password, how can I reset it?',
      answer: 'Click on "Forgot Password" on the login page and enter your email. We\'ll send you a reset link.',
      popular: true
    },
    {
      category: 'orders',
      question: 'How can I track my order?',
      answer: 'Go to your profile and click on "Order History". You\'ll see tracking information for all your orders.',
      popular: true
    },
    {
      category: 'orders',
      question: 'What are the shipping options available?',
      answer: 'We offer standard shipping (5-7 days) and express shipping (2-3 days). Shipping costs vary by location.',
      popular: false
    },
    {
      category: 'payments',
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, debit cards, and digital wallet payments through MercadoPago.',
      popular: true
    },
    {
      category: 'payments',
      question: 'Is my payment information secure?',
      answer: 'Yes, all payments are processed securely through MercadoPago with industry-standard encryption.',
      popular: false
    },
    {
      category: 'returns',
      question: 'What is your return policy?',
      answer: 'You can return items within 30 days of delivery in original condition. Return shipping costs apply.',
      popular: true
    },
    {
      category: 'returns',
      question: 'How long does it take to process a refund?',
      answer: 'Refunds are processed within 5-10 business days after we receive the returned item.',
      popular: false
    },
    {
      category: 'technical',
      question: 'The website is not loading properly',
      answer: 'Try clearing your browser cache and cookies. If the issue persists, try using a different browser.',
      popular: false
    },
    {
      category: 'security',
      question: 'How do you protect my personal information?',
      answer: 'We use advanced encryption and security measures. Read our Privacy Policy for full details.',
      popular: false
    }
  ];

  get filteredFAQs() {
    let filtered = this.faqItems;
    
    if (this.selectedCategory) {
      filtered = filtered.filter(item => item.category === this.selectedCategory);
    }
    
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.question.toLowerCase().includes(query) || 
        item.answer.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }

  get popularFAQs() {
    return this.faqItems.filter(item => item.popular);
  }

  get selectedCategoryName(): string {
    const category = this.categories.find(c => c.id === this.selectedCategory);
    return category ? category.name : '';
  }

  selectCategory(categoryId: string): void {
    this.selectedCategory = categoryId === this.selectedCategory ? '' : categoryId;
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.selectedCategory = '';
  }
}
