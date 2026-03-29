import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { LoginRequest } from '../../../core/auth/auth.models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  private readonly defaultEmail = 'admin@assetra.com';
  private readonly defaultPassword = 'Password123';

  loading = signal(false);
  error = signal<string | null>(null);

  form = this.fb.group({
    email: [this.defaultEmail, [Validators.required, Validators.email]],
    password: [this.defaultPassword, [Validators.required]]
  });

  constructor() {
    if (this.auth.isAuthenticated()) {
      this.router.navigateByUrl('/dashboard/pm');
    }
  }

  submit(): void {
    if (this.loading()) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const payload = this.form.getRawValue() as LoginRequest;

    this.auth
      .login(payload)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => this.router.navigateByUrl('/dashboard/pm'),
        error: () =>
          this.error.set('Invalid credentials or a server error occurred.')
      });
  }
}
