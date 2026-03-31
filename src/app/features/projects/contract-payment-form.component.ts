import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject,
  signal
} from '@angular/core';
import {
  ReactiveFormsModule,
  UntypedFormBuilder,
  Validators
} from '@angular/forms';
import {
  ProjectContractMilestone,
  ProjectContractPaymentMode,
  RecordProjectContractPaymentPayload
} from './data-access/project-contracts.api';
import { ProjectContractsStore } from './data-access/project-contracts.store';

@Component({
  selector: 'app-contract-payment-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contract-payment-form.component.html',
  styleUrls: ['./contract-payment-form.component.css']
})
export class ContractPaymentFormComponent implements OnChanges {
  private readonly fb = inject(UntypedFormBuilder);
  readonly store = inject(ProjectContractsStore);

  @Input({ required: true }) contractId!: number;
  @Input({ required: true }) contractBalance!: number;
  @Input() milestones: ProjectContractMilestone[] = [];
  @Input() defaultMilestoneId: number | null = null;

  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  readonly paymentModes: ProjectContractPaymentMode[] = [
    'CASH',
    'BANK',
    'ONLINE',
    'CHEQUE'
  ];

  localError = signal<string | null>(null);

  form = this.fb.group({
    milestoneId: [null],
    paymentDate: [this.today(), Validators.required],
    amount: [null, [Validators.required, Validators.min(0.01)]],
    paymentMode: ['CASH'],
    receiptNo: [''],
    remarks: ['']
  });

  ngOnChanges(changes: SimpleChanges): void {
    if ('defaultMilestoneId' in changes) {
      this.form.patchValue({
        milestoneId: this.defaultMilestoneId
      });
    }
  }

  selectedMilestone(): ProjectContractMilestone | undefined {
    const milestoneId = Number(this.form.get('milestoneId')?.value ?? 0);
    if (!milestoneId) {
      return undefined;
    }

    return this.milestones.find((milestone) => milestone.id === milestoneId);
  }

  maxAllowedAmount(): number {
    const milestone = this.selectedMilestone();
    if (milestone) {
      return Number(milestone.balance ?? 0);
    }

    return Number(this.contractBalance ?? 0);
  }

  exceedsLimit(): boolean {
    const amount = Number(this.form.get('amount')?.value ?? 0);
    if (!amount) {
      return false;
    }

    return amount - this.maxAllowedAmount() > 0.01;
  }

  async submit(): Promise<void> {
    if (this.store.saving()) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.exceedsLimit()) {
      this.localError.set('Payment amount exceeds remaining balance.');
      return;
    }

    this.localError.set(null);

    const raw = this.form.getRawValue();
    const payload: RecordProjectContractPaymentPayload = {
      contractId: Number(this.contractId),
      milestoneId: this.toOptionalNumber(raw.milestoneId),
      paymentDate: String(raw.paymentDate ?? ''),
      amount: Number(raw.amount ?? 0),
      paymentMode: this.toOptionalPaymentMode(raw.paymentMode),
      receiptNo: this.toOptionalString(raw.receiptNo),
      remarks: this.toOptionalString(raw.remarks)
    };

    const ok = await this.store.recordPayment(payload);
    if (ok) {
      this.saved.emit();
      return;
    }

    this.localError.set(this.store.error() || 'Failed to record payment.');
  }

  close(): void {
    if (this.store.saving()) {
      return;
    }

    this.cancelled.emit();
  }

  private today(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private toOptionalNumber(value: unknown): number | undefined {
    if (value === null || value === undefined || value === '') {
      return undefined;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  private toOptionalString(value: unknown): string | undefined {
    const text = String(value ?? '').trim();
    return text ? text : undefined;
  }

  private toOptionalPaymentMode(
    value: unknown
  ): ProjectContractPaymentMode | undefined {
    const mode = String(value ?? '').toUpperCase();
    return this.paymentModes.includes(mode as ProjectContractPaymentMode)
      ? (mode as ProjectContractPaymentMode)
      : undefined;
  }
}
