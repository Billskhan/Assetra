import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { Project } from '../projects/projects.models';
import { ProjectsService } from '../projects/projects.service';
import {
  CreateContractRequest,
  VendorOption
} from './contracts.models';
import { ContractsService } from './contracts.service';

@Component({
  selector: 'app-create-contract',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-contract.component.html',
  styleUrls: ['./create-contract.component.css']
})
export class CreateContractComponent implements OnInit {
  private fb = inject(FormBuilder);
  private contractsService = inject(ContractsService);
  private projectsService = inject(ProjectsService);

  loading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  projectsLoading = signal(true);
  vendorsLoading = signal(true);
  projectsError = signal<string | null>(null);
  vendorsError = signal<string | null>(null);
  projects = signal<Project[]>([]);
  vendors = signal<VendorOption[]>([]);

  form = this.fb.group({
    title: ['', [Validators.required]],
    description: [''],
    totalAmount: [null as number | null, [Validators.required, Validators.min(0.01)]],
    projectId: [null as number | null, [Validators.required]],
    vendorId: [null as number | null, [Validators.required]]
  });

  ngOnInit(): void {
    this.loadProjects();
    this.loadVendors();
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
    this.success.set(null);

    const raw = this.form.getRawValue();

    const payload: CreateContractRequest = {
      title: raw.title ?? '',
      description: raw.description || undefined,
      totalAmount: Number(raw.totalAmount ?? 0),
      projectId: Number(raw.projectId),
      vendorId: Number(raw.vendorId)
    };

    this.contractsService
      .createContract(payload)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.success.set('Contract created successfully.');
          this.form.reset({
            title: '',
            description: '',
            totalAmount: null,
            projectId: null,
            vendorId: null
          });
        },
        error: () => this.error.set('Failed to create contract.')
      });
  }

  private loadProjects(): void {
    this.projectsLoading.set(true);
    this.projectsError.set(null);

    this.projectsService.getProjects().subscribe({
      next: (projects) => {
        this.projects.set(projects ?? []);
        this.projectsLoading.set(false);
      },
      error: () => {
        this.projectsError.set('Failed to load projects.');
        this.projectsLoading.set(false);
      }
    });
  }

  private loadVendors(): void {
    this.vendorsLoading.set(true);
    this.vendorsError.set(null);

    this.contractsService.getVendors().subscribe({
      next: (vendors) => {
        this.vendors.set(vendors ?? []);
        this.vendorsLoading.set(false);
      },
      error: () => {
        this.vendorsError.set('Failed to load vendors.');
        this.vendorsLoading.set(false);
      }
    });
  }
}
