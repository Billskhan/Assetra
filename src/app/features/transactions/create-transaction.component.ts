import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { finalize, startWith } from 'rxjs';
import { Project } from '../projects/projects.models';
import { ProjectsService } from '../projects/projects.service';
import {
  CreateTransactionRequest,
  TransactionItemRequest
} from './transactions.models';
import { TransactionsService } from './transactions.service';

type TransactionItemForm = FormGroup<{
  name: FormControl<string>;
  quantity: FormControl<number>;
  unitPrice: FormControl<number>;
}>;

type TransactionFormValue = {
  title: string;
  projectId: number | null;
  contractId: number | null;
  items: TransactionItemRequest[];
};

@Component({
  selector: 'app-create-transaction',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-transaction.component.html',
  styleUrls: ['./create-transaction.component.css']
})
export class CreateTransactionComponent implements OnInit {
  private fb = inject(FormBuilder);
  private transactionsService = inject(TransactionsService);
  private projectsService = inject(ProjectsService);
  private route = inject(ActivatedRoute);

  saving = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  projectsLoading = signal(true);
  projectsError = signal<string | null>(null);
  projects = signal<Project[]>([]);

  form = this.fb.group({
    title: this.fb.control('', {
      nonNullable: true,
      validators: [Validators.required]
    }),
    projectId: this.fb.control<number | null>(null, {
      validators: [Validators.required]
    }),
    contractId: this.fb.control<number | null>(null),
    items: this.fb.array<TransactionItemForm>([this.createItem()])
  });

  private formValue = toSignal(
    this.form.valueChanges.pipe(
      startWith(this.form.getRawValue() as TransactionFormValue)
    ),
    { initialValue: this.form.getRawValue() as TransactionFormValue }
  );

  total = computed(() => {
    const value = this.formValue();
    const items = value.items ?? [];
    return items.reduce((sum, item) => {
      const quantity = Number(item.quantity ?? 0);
      const unitPrice = Number(item.unitPrice ?? 0);
      return sum + quantity * unitPrice;
    }, 0);
  });

  get items(): FormArray<TransactionItemForm> {
    return this.form.get('items') as FormArray<TransactionItemForm>;
  }

  ngOnInit(): void {
    this.loadProjects();
    this.applyProjectParam();
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
    const group = this.items.at(index) as TransactionItemForm;
    const value = group.getRawValue() as TransactionItemRequest;
    return Number(value.quantity ?? 0) * Number(value.unitPrice ?? 0);
  }

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
    this.success.set(null);

    const raw = this.form.getRawValue() as TransactionFormValue;

    const payload: CreateTransactionRequest = {
      title: raw.title ?? '',
      projectId: Number(raw.projectId),
      contractId:
        raw.contractId === null || raw.contractId === undefined
          ? undefined
          : Number(raw.contractId),
      items: (raw.items ?? []).map((item) => ({
        name: item.name ?? '',
        quantity: Number(item.quantity ?? 0),
        unitPrice: Number(item.unitPrice ?? 0)
      }))
    };

    this.transactionsService
      .createTransaction(payload)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.success.set('Transaction created successfully.');
          this.resetForm();
        },
        error: (err: unknown) => {
          const message = this.extractErrorMessage(err);
          this.error.set(message ?? 'Failed to create transaction.');
        }
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

  private applyProjectParam(): void {
    const projectIdParam = this.route.snapshot.queryParamMap.get('projectId');
    if (!projectIdParam) {
      return;
    }

    const projectId = Number(projectIdParam);
    if (!Number.isFinite(projectId)) {
      return;
    }

    this.form.patchValue({ projectId });
  }

  private createItem(): TransactionItemForm {
    return this.fb.group({
      name: this.fb.control('', {
        nonNullable: true,
        validators: [Validators.required]
      }),
      quantity: this.fb.control(1, {
        nonNullable: true,
        validators: [Validators.required, Validators.min(1)]
      }),
      unitPrice: this.fb.control(0, {
        nonNullable: true,
        validators: [Validators.required, Validators.min(0)]
      })
    });
  }

  private resetForm(): void {
    this.form.reset({
      title: '',
      projectId: null,
      contractId: null
    });

    while (this.items.length > 0) {
      this.items.removeAt(0);
    }

    this.items.push(this.createItem());
  }

  private extractErrorMessage(error: unknown): string | null {
    if (!error) {
      return null;
    }

    if (typeof error === 'string') {
      return error;
    }

    if (error instanceof Error && error.message) {
      return error.message;
    }

    const candidate = error as { message?: string | string[] };
    if (Array.isArray(candidate.message)) {
      return candidate.message.filter(Boolean).join(', ');
    }

    if (typeof candidate.message === 'string' && candidate.message.trim().length > 0) {
      return candidate.message;
    }

    return null;
  }
}