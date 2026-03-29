import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
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
        next: () => this.router.navigateByUrl('/dashboard/pm'),
        error: (err: HttpErrorResponse) => {
          const serverMessage = this.extractErrorMessage(err);
          this.error.set(serverMessage ?? 'Failed to create project.');
        }
      });
  }

  private extractErrorMessage(error: HttpErrorResponse): string | null {
    if (!error) {
      return null;
    }

    const payload = error.error as
      | { message?: string | string[]; error?: string }
      | string
      | null;

    if (typeof payload === 'string') {
      return payload;
    }

    const message = payload?.message;
    if (Array.isArray(message)) {
      return message.filter(Boolean).join(', ');
    }

    if (typeof message === 'string' && message.trim().length > 0) {
      return message;
    }

    if (typeof payload?.error === 'string' && payload.error.trim().length > 0) {
      return payload.error;
    }

    if (typeof error.status === 'number' && error.status !== 0) {
      return `Request failed (${error.status}).`;
    }

    return null;
  }
}