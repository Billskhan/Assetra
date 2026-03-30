import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';
import {
  getMockProjectById,
  PortfolioProject,
  ProjectVendor
} from '../../core/mock/portfolio.mock';
import { Vendor, VendorsService } from '../vendors/vendors.service';
import { Project } from './projects.models';
import { ProjectsService } from './projects.service';

@Component({
  selector: 'app-project-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './project-dashboard.component.html',
  styleUrls: ['./project-dashboard.component.css']
})
export class ProjectDashboardComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private projectsService = inject(ProjectsService);
  private vendorsService = inject(VendorsService);

  private projectId: number | null = null;
  project = signal<PortfolioProject | null>(null);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isFinite(id)) {
      this.project.set(null);
      return;
    }

    this.projectId = id;

    this.projectsService
      .getProjectById(id)
      .pipe(catchError(() => of(null)))
      .subscribe((project) => {
        if (project) {
          this.project.set(this.mapApiProject(project));
          this.loadAssignedVendors(id);
          return;
        }

        this.project.set(getMockProjectById(id));
        this.loadAssignedVendors(id);
      });
  }

  addVendor(): void {
    if (!this.projectId) {
      return;
    }

    this.router.navigate(['/vendors'], {
      queryParams: { projectId: this.projectId }
    });
  }

  removeVendor(): void {
    if (!this.projectId) {
      return;
    }

    this.router.navigate(['/vendors'], {
      queryParams: { projectId: this.projectId }
    });
  }

  createContract(): void {
    if (!this.projectId) {
      return;
    }

    this.router.navigate(['/contracts/new'], {
      queryParams: { projectId: this.projectId }
    });
  }

  addTransaction(): void {
    if (!this.projectId) {
      return;
    }

    this.router.navigate(['/transactions/new'], {
      queryParams: { projectId: this.projectId }
    });
  }

  private loadAssignedVendors(projectId: number): void {
    this.vendorsService
      .getVendorsByProject(projectId)
      .pipe(catchError(() => of([] as Vendor[])))
      .subscribe((vendors) => {
        const current = this.project();
        if (!current) {
          return;
        }

        this.project.set({
          ...current,
          vendors: vendors.map((vendor) => this.mapProjectVendor(vendor))
        });
      });
  }

  private mapProjectVendor(vendor: Vendor): ProjectVendor {
    return {
      id: vendor.id,
      name: vendor.name,
      category: vendor.isGlobal ? 'Global Vendor' : 'Project Vendor',
      status: 'Active'
    };
  }

  private mapApiProject(project: Project): PortfolioProject {
    return {
      id: project.id,
      name: project.name,
      description: project.description ?? 'No description provided.',
      location: project.location ?? 'TBD',
      startDate: project.startDate ? String(project.startDate) : '',
      endDate: project.endDate ? String(project.endDate) : '',
      budget: project.budget ?? 0,
      status: this.getStatus(project),
      vendors: [],
      contracts: [],
      transactions: []
    };
  }

  private getStatus(project: Project): string {
    const now = Date.now();
    const start = project.startDate ? new Date(project.startDate).getTime() : null;
    const end = project.endDate ? new Date(project.endDate).getTime() : null;

    if (end && end < now) {
      return 'Completed';
    }

    if (start && start > now) {
      return 'Planned';
    }

    return 'Active';
  }
}