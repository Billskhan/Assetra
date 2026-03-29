import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Project } from './projects.models';

@Injectable({
  providedIn: 'root'
})
export class ProjectsService {
  constructor(private http: HttpClient) {}

  getProjects() {
    return this.http.get<Project[]>('/projects');
  }

  getProjectById(id: number) {
    return this.http.get<Project>(`/projects/${id}`);
  }

  createProject(payload: {
    name: string;
    description?: string;
    budget: number;
  }) {
    return this.http.post<Project>('/projects', payload);
  }
}
