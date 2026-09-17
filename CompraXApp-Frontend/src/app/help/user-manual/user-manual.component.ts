import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-user-manual',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './user-manual.component.html',
  styleUrl: './user-manual.component.css'
})
export class UserManualComponent {
  sections = [
    { id: 'getting-started', title: 'Getting Started', icon: '🚀' },
    { id: 'browsing', title: 'Browsing Products', icon: '🔍' },
    { id: 'shopping', title: 'Shopping Cart', icon: '🛒' },
    { id: 'checkout', title: 'Checkout Process', icon: '💳' },
    { id: 'account', title: 'Account Management', icon: '👤' },
    { id: 'admin', title: 'Admin Features', icon: '⚙️' },
    { id: 'troubleshooting', title: 'Troubleshooting', icon: '🛠️' }
  ];

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
