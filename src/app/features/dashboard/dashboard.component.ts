import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { AuthRole } from '../../core/auth/auth.models';
import {
  ManagerDashboardResponse,
  PmDashboardResponse
} from './dashboard.models';
import { DashboardService } from './dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  private auth = inject(AuthService);
  private dashboard = inject(DashboardService);

  loading = signal(true);
  error = signal<string | null>(null);
  role = signal<AuthRole | null>(null);
  pmDashboard = signal<PmDashboardResponse | null>(null);
  managerDashboard = signal<ManagerDashboardResponse | null>(null);

  ngOnInit(): void {
    this.loadDashboard();
  }

  private loadDashboard(): void {
    const user = this.auth.currentUser();
    const role = user?.role ?? null;
    this.role.set(role);

    if (!role) {
      this.error.set('No active session found.');
      this.loading.set(false);
      return;
    }

    let request$: Observable<PmDashboardResponse | ManagerDashboardResponse> | null = null;

    if (role === 'ADMIN' || role === 'PROJECT_MANAGER') {
      request$ = this.dashboard.getPmDashboard();
    } else if (role === 'MANAGER') {
      request$ = this.dashboard.getManagerDashboard();
    } else if (role === 'STAKEHOLDER') {
      this.loading.set(false);
      return;
    } else {
      this.error.set('Dashboard not available for this role yet.');
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    request$.subscribe({
      next: (response) => {
        if (role === 'MANAGER') {
          this.managerDashboard.set(response as ManagerDashboardResponse);
        } else {
          this.pmDashboard.set(response as PmDashboardResponse);
        }
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load dashboard.');
        this.loading.set(false);
      }
    });
  }
}
