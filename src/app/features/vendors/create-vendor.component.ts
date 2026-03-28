import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { VendorsService } from './vendors.service';

@Component({
  selector: 'app-create-vendor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './create-vendor.component.html'
})
export class CreateVendorComponent {
  private fb = inject(FormBuilder);
  private vendorsService = inject(VendorsService);
  private router = inject(Router);

  saving = signal(false);
  error = signal<string | null>(null);

  form = this.fb.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.email]],
    phone: [''],
    isGlobal: [false]
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

    this.vendorsService
      .createVendor({
        name: raw.name ?? '',
        email: raw.email || undefined,
        phone: raw.phone || undefined,
        isGlobal: raw.isGlobal ?? false
      })
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => this.router.navigateByUrl('/vendors'),
        error: () => this.error.set('Failed to create vendor.')
      });
  }
}
