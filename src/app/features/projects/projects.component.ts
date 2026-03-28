import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Project } from './projects.models';
import { ProjectsService } from './projects.service';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent implements OnInit {
  private projectsService = inject(ProjectsService);

  loading = signal(true);
  error = signal<string | null>(null);
  projects = signal<Project[]>([]);

  ngOnInit(): void {
    this.loadProjects();
  }

  private loadProjects(): void {
    this.loading.set(true);
    this.error.set(null);

    this.projectsService.getProjects().subscribe({
      next: (projects) => {
        this.projects.set(projects ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load projects.');
        this.loading.set(false);
      }
    });
  }
}
