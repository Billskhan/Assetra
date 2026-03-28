import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { finalize, startWith } from 'rxjs';
import {
  TransactionCreateRequest,
  TransactionItemInput
} from './transaction-create.models';
import { TransactionsService } from './transactions.service';

@Component({
  selector: 'app-transaction-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './transaction-create.component.html',
  styleUrls: ['./transaction-create.component.css']
})
export class TransactionCreateComponent {
  private fb = inject(FormBuilder);
  private transactionsService = inject(TransactionsService);

  loading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  form = this.fb.group({
    title: ['', [Validators.required]],
    projectId: ['', [Validators.required]],
    contractId: [''],
    items: this.fb.array([this.createItem()])
  });

  private formValue = toSignal(
    this.form.valueChanges.pipe(startWith(this.form.getRawValue())),
    {
      initialValue: this.form.getRawValue()
    }
  );

  total = computed(() => {
    const value = this.formValue();
    const items = value.items ?? [];
    return items.reduce((sum, item) => {
      const quantity = Number(item?.quantity ?? 0);
      const unitPrice = Number(item?.unitPrice ?? 0);
      return sum + quantity * unitPrice;
    }, 0);
  });

  get items(): FormArray {
    return this.form.get('items') as FormArray;
  }

  addItem(): void {
    this.items.push(this.createItem());
  }

  removeItem(index: number): void {
    if (this.items.length > 1) {
      this.items.removeAt(index);
    }
  }

  itemTotal(index: number): number {
    const group = this.items.at(index) as FormGroup;
    const value = group.getRawValue() as TransactionItemInput;
    return Number(value.quantity ?? 0) * Number(value.unitPrice ?? 0);
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

    const payload: TransactionCreateRequest = {
      title: raw.title ?? '',
      projectId: raw.projectId ?? '',
      contractId: raw.contractId || undefined,
      items: (raw.items ?? []).map((item) => ({
        name: item?.name ?? '',
        quantity: Number(item?.quantity ?? 0),
        unitPrice: Number(item?.unitPrice ?? 0)
      }))
    };

    this.transactionsService
      .createTransaction(payload)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.success.set('Transaction created successfully.');
          this.resetForm();
        },
        error: () => this.error.set('Failed to create transaction.')
      });
  }

  private createItem(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required]],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitPrice: [0, [Validators.required, Validators.min(0)]]
    });
  }

  private resetForm(): void {
    this.form.reset({
      title: '',
      projectId: '',
      contractId: '',
      items: []
    });

    while (this.items.length > 0) {
      this.items.removeAt(0);
    }

    this.items.push(this.createItem());
  }
}
