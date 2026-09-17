import { Component } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router'; 
import { NavbarComponent } from './layout/navbar/navbar.component';
import { CommonModule } from '@angular/common';
import { ToastComponent } from './components/toast/toast.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, CommonModule, RouterModule, ToastComponent], 
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'CompraXApp-Frontend';
  currentYear = new Date().getFullYear();
}
