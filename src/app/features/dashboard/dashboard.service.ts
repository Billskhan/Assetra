import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ManagerDashboardResponse, PmDashboardResponse } from './dashboard.models';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(private http: HttpClient) {}

  getPmDashboard() {
    return this.http.get<PmDashboardResponse>('/dashboard/pm');
  }

  getManagerDashboard() {
    return this.http.get<ManagerDashboardResponse>('/dashboard/manager');
  }
}
