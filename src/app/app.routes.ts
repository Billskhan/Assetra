import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { AppShellComponent } from './layout/app-shell/app-shell.component';

export const appRoutes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(
        (m) => m.LoginComponent
      )
  },
  {
    path: '',
    component: AppShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent
          )
      },
      {
        path: 'projects/new',
        loadComponent: () =>
          import('./features/projects/create-project.component').then(
            (m) => m.CreateProjectComponent
          )
      },
      {
        path: 'projects',
        loadComponent: () =>
          import('./features/projects/projects.component').then(
            (m) => m.ProjectsComponent
          )
      },
      {
        path: 'vendors/new',
        loadComponent: () =>
          import('./features/vendors/create-vendor.component').then(
            (m) => m.CreateVendorComponent
          )
      },
      {
        path: 'vendors',
        loadComponent: () =>
          import('./features/vendors/vendors.component').then(
            (m) => m.VendorsComponent
          )
      },
      {
        path: 'transactions/new',
        loadComponent: () =>
          import('./features/transactions/create-transaction.component').then(
            (m) => m.CreateTransactionComponent
          )
      }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
