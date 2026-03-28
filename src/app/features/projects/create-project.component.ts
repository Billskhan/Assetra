import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { ProjectsService } from './projects.service';

@Component({
  selector: 'app-create-project',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './create-project.component.html'
})
export class CreateProjectComponent {
  private fb = inject(FormBuilder);
  private projectsService = inject(ProjectsService);
  private router = inject(Router);

  saving = signal(false);
  error = signal<string | null>(null);

  form = this.fb.group({
    name: ['', [Validators.required]],
    description: [''],
    budget: [null as number | null, [Validators.required, Validators.min(0.01)]]
  });

  submit(): void {
    if (this.saving()) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.error.set(null);

    const raw = this.form.getRawValue();

    this.projectsService
      .createProject({
        name: raw.name ?? '',
        description: raw.description || undefined,
        budget: Number(raw.budget ?? 0)
      })
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => this.router.navigateByUrl('/projects'),
        error: () => this.error.set('Failed to create project.')
      });
  }
}
