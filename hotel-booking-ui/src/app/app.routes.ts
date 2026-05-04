import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/login/login.component').then((m) => m.LoginComponent)
  },
  {
    path: 'hotels',
    canActivate: [authGuard, roleGuard(['USER', 'ADMIN'])],
    loadComponent: () =>
      import('./features/user-dashboard/user-dashboard.component').then(
        (m) => m.UserDashboardComponent
      )
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard(['ADMIN'])],
    loadComponent: () =>
      import('./features/admin-dashboard/admin-dashboard.component').then(
        (m) => m.AdminDashboardComponent
      )
  },
  { path: '**', redirectTo: 'login' }
];
