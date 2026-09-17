import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AdminProductsComponent } from './admin-products/admin-products.component';
import { ProductFormComponent } from './product-form/product-form.component';
import { AdminUsersComponent } from './admin-users/admin-users.component';
import { AdminOrdersComponent } from './admin-orders/admin-orders.component';
import { AdminSettingsComponent } from './admin-settings/admin-settings.component';
import { AdminPromotionsComponent } from './admin-promotions/admin-promotions.component';

const routes: Routes = [
  { path: '', component: AdminDashboardComponent },
  { path: 'products', component: AdminProductsComponent },
  { path: 'products/create', component: ProductFormComponent },
  { path: 'products/edit/:id', component: ProductFormComponent },
  { path: 'users', component: AdminUsersComponent },
  { path: 'orders', component: AdminOrdersComponent },
  { path: 'settings', component: AdminSettingsComponent },
  {
    path: 'reports',
    loadComponent: () =>
      import('./admin-reports/admin-reports.component').then(
        (m) => m.AdminReportsComponent
      ),
    data: { title: 'Product Statistics' },
  },
  {
    path: 'promotions',
    component: AdminPromotionsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
