import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import {
  ReactiveFormsModule,
  UntypedFormArray,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators
} from '@angular/forms';
import {
  CreateProjectContractPayload
} from './data-access/project-contracts.api';
import { ProjectContractsStore } from './data-access/project-contracts.store';

export interface ProjectContractVendorOption {
  id: number;
  name: string;
}

@Component({
  selector: 'app-project-contract-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './project-contract-form.component.html',
  styleUrls: ['./project-contract-form.component.css']
})
export class ProjectContractFormComponent {
  private readonly fb = inject(UntypedFormBuilder);
  readonly store = inject(ProjectContractsStore);

  @Input({ required: true }) projectId!: number;
  @Input() vendors: ProjectContractVendorOption[] = [];

  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  localError = signal<string | null>(null);

  form = this.fb.group({
    vendorId: [null, Validators.required],
    title: ['', Validators.required],
    type: [''],
    scopeOfWork: [''],
    totalAmount: [null, [Validators.required, Validators.min(0.01)]],
    startDate: [''],
    expectedEndDate: [''],
    notes: [''],
    milestones: this.fb.array([])
  });

  constructor() {
    this.addMilestone();
  }

  get milestones(): UntypedFormArray {
    return this.form.get('milestones') as UntypedFormArray;
  }

  get milestoneForms(): UntypedFormGroup[] {
    return this.milestones.controls as UntypedFormGroup[];
  }

  addMilestone(): void {
    const nextSequence = this.milestones.length + 1;
    this.milestones.push(
      this.fb.group({
        name: ['', Validators.required],
        sequenceNo: [nextSequence, [Validators.required, Validators.min(1)]],
        targetValue: [null],
        unit: [''],
        amount: [null, [Validators.required, Validators.min(0.01)]],
        remarks: ['']
      })
    );
  }

  removeMilestone(index: number): void {
    if (this.milestones.length <= 1) {
      return;
    }

    this.milestones.removeAt(index);
  }

  milestonesTotal(): number {
    return this.milestoneForms.reduce((sum, row) => {
      return sum + Number(row.get('amount')?.value ?? 0);
    }, 0);
  }

  hasMilestoneTotalMismatch(): boolean {
    const contractTotal = Number(this.form.get('totalAmount')?.value ?? 0);
    const milestoneTotal = this.milestonesTotal();

    if (!contractTotal || !milestoneTotal) {
      return false;
    }

    return Math.abs(contractTotal - milestoneTotal) > 0.01;
  }

  async submit(): Promise<void> {
    if (this.store.saving()) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.milestones.length === 0) {
      this.localError.set('At least one milestone is required.');
      return;
    }

    if (this.hasMilestoneTotalMismatch()) {
      this.localError.set('Milestone total must match contract total amount.');
      return;
    }

    this.localError.set(null);

    const raw = this.form.getRawValue();
    const payload: CreateProjectContractPayload = {
      projectId: Number(this.projectId),
      vendorId: Number(raw.vendorId),
      title: String(raw.title ?? '').trim(),
      type: this.toOptionalString(raw.type),
      scopeOfWork: this.toOptionalString(raw.scopeOfWork),
      totalAmount: Number(raw.totalAmount ?? 0),
      startDate: this.toOptionalString(raw.startDate),
      expectedEndDate: this.toOptionalString(raw.expectedEndDate),
      notes: this.toOptionalString(raw.notes),
      milestones: this.milestoneForms.map((row) => ({
        name: String(row.get('name')?.value ?? '').trim(),
        sequenceNo: Number(row.get('sequenceNo')?.value ?? 0),
        targetValue: this.toOptionalNumber(row.get('targetValue')?.value),
        unit: this.toOptionalString(row.get('unit')?.value),
        amount: Number(row.get('amount')?.value ?? 0),
        remarks: this.toOptionalString(row.get('remarks')?.value)
      }))
    };

    const ok = await this.store.createContract(payload);
    if (ok) {
      this.saved.emit();
      return;
    }

    this.localError.set(this.store.error() || 'Failed to create contract.');
  }

  close(): void {
    if (this.store.saving()) {
      return;
    }

    this.cancelled.emit();
  }

  trackByIndex(index: number): number {
    return index;
  }

  private toOptionalString(value: unknown): string | undefined {
    const text = String(value ?? '').trim();
    return text ? text : undefined;
  }

  private toOptionalNumber(value: unknown): number | undefined {
    if (value === null || value === undefined || value === '') {
      return undefined;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
}
