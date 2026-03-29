import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { ProjectsService } from '../projects/projects.service';
import { Project } from '../projects/projects.models';
import { MOCK_STAKEHOLDERS, MOCK_VENDORS } from '../../core/mock/portfolio.mock';
import { PmDashboardView } from './dashboard.models';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(private projectsService: ProjectsService) {}

  getPmDashboard() {
    return this.projectsService.getProjects().pipe(
      map((projects) => this.buildDashboard(projects))
    );
  }

  private buildDashboard(projects: Project[]): PmDashboardView {
    const mappedProjects = projects.map((project) => ({
      id: project.id,
      name: project.name,
      location: project.location ?? 'TBD',
      budget: project.budget ?? 0,
      status: this.getProjectStatus(project)
    }));

    return {
      summary: {
        totalProjects: mappedProjects.length,
        totalVendors: MOCK_VENDORS.length,
        totalStakeholders: MOCK_STAKEHOLDERS.length
      },
      projects: mappedProjects,
      vendors: MOCK_VENDORS,
      stakeholders: MOCK_STAKEHOLDERS
    };
  }


  private getProjectStatus(project: Project): string {
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
