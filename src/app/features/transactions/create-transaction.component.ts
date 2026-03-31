import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, finalize, of, startWith } from 'rxjs';
import { ProjectsService } from '../projects/projects.service';
import { Vendor, VendorsService } from '../vendors/vendors.service';
import {
  CreateTransactionRequest,
  TransactionEntryType,
  TransactionPaymentMode
} from './transactions.models';
import { TransactionsService } from './transactions.service';

function amountValidator(control: AbstractControl): ValidationErrors | null {
  const totalAmount = Number(control.get('totalAmount')?.value ?? 0);
  const paidAmount = Number(control.get('paidAmount')?.value ?? 0);
  const balance = Number(control.get('balance')?.value ?? 0);

  if (!Number.isFinite(totalAmount) || !Number.isFinite(paidAmount) || !Number.isFinite(balance)) {
    return null;
  }

  if (paidAmount > totalAmount) {
    return { paidAmountExceedsTotal: true };
  }

  if (balance < 0) {
    return { balanceNegative: true };
  }

  return null;
}

type TransactionForm = FormGroup<{
  projectId: FormControl<number | null>;
  date: FormControl<string>;
  entryType: FormControl<TransactionEntryType>;
  vendorId: FormControl<number | null>;
  paymentMode: FormControl<TransactionPaymentMode>;
  category: FormControl<string>;
  subCategory: FormControl<string>;
  item: FormControl<string>;
  quantity: FormControl<number | null>;
  unit: FormControl<string>;
  rate: FormControl<number | null>;
  totalAmount: FormControl<number>;
  paidAmount: FormControl<number>;
  balance: FormControl<number>;
  stageName: FormControl<string>;
  receiptNo: FormControl<string>;
  carriage: FormControl<number | null>;
  length: FormControl<string>;
  comments: FormControl<string>;
}>;

@Component({
  selector: 'app-create-transaction',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './create-transaction.component.html',
  styleUrls: ['./create-transaction.component.css']
})
export class CreateTransactionComponent implements OnInit {
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private projectsService = inject(ProjectsService);
  private vendorsService = inject(VendorsService);
  private transactionsService = inject(TransactionsService);

  readonly entryTypeOptions: TransactionEntryType[] = ['Service', 'Material'];
  readonly paymentModeOptions: TransactionPaymentMode[] = [
    'Cash',
    'Bank',
    'Online',
    'Cheque'
  ];

  saving = signal(false);
  error = signal<string | null>(null);
  projectContextError = signal<string | null>(null);
  projectName = signal<string | null>(null);
  currentProjectId = signal<number | null>(null);
  optionalExpanded = signal(false);

  vendorsLoading = signal(false);
  vendorsError = signal<string | null>(null);
  vendors = signal<Vendor[]>([]);

  private manualTotalOverride = false;
  private manualBalanceOverride = false;
  private syncingValues = false;

  form: TransactionForm = this.fb.group(
    {
      projectId: this.fb.control<number | null>(null, {
        validators: [Validators.required]
      }),
      date: this.fb.control(this.today(), {
        nonNullable: true,
        validators: [Validators.required]
      }),
      entryType: this.fb.control<TransactionEntryType>('Service', {
        nonNullable: true,
        validators: [Validators.required]
      }),
      vendorId: this.fb.control<number | null>(null, {
        validators: [Validators.required]
      }),
      paymentMode: this.fb.control<TransactionPaymentMode>('Cash', {
        nonNullable: true,
        validators: [Validators.required]
      }),
      category: this.fb.control('', {
        nonNullable: true,
        validators: [Validators.required]
      }),
      subCategory: this.fb.control('', {
        nonNullable: true,
        validators: [Validators.required]
      }),
      item: this.fb.control('', {
        nonNullable: true,
        validators: [Validators.required]
      }),
      quantity: this.fb.control<number | null>(null),
      unit: this.fb.control('', {
        nonNullable: true
      }),
      rate: this.fb.control<number | null>(null),
      totalAmount: this.fb.control(0, {
        nonNullable: true,
        validators: [Validators.required, Validators.min(0)]
      }),
      paidAmount: this.fb.control(0, {
        nonNullable: true,
        validators: [Validators.required, Validators.min(0)]
      }),
      balance: this.fb.control(0, {
        nonNullable: true,
        validators: [Validators.min(0)]
      }),
      stageName: this.fb.control('', {
        nonNullable: true
      }),
      receiptNo: this.fb.control('', {
        nonNullable: true
      }),
      carriage: this.fb.control<number | null>(null),
      length: this.fb.control('', {
        nonNullable: true
      }),
      comments: this.fb.control('', {
        nonNullable: true
      })
    },
    {
      validators: [amountValidator]
    }
  ) as TransactionForm;

  calculatedTotal = computed(() => {
    const quantity = Number(this.form.controls.quantity.value ?? 0);
    const rate = Number(this.form.controls.rate.value ?? 0);
    const carriage = Number(this.form.controls.carriage.value ?? 0);

    if (!quantity || !rate) {
      return null;
    }

    return quantity * rate + carriage;
  });

  amountSnapshot = computed(() => ({
    total: this.form.controls.totalAmount.value,
    paid: this.form.controls.paidAmount.value,
    balance: this.form.controls.balance.value
  }));

  ngOnInit(): void {
    this.applyProjectContext();
    this.setupAmountLogic();
  }

  toggleOptionalDetails(): void {
    this.optionalExpanded.update((expanded) => !expanded);
  }

  useCalculatedTotal(): void {
    const calculatedTotal = this.calculatedTotal();
    if (calculatedTotal === null) {
      return;
    }

    this.manualTotalOverride = false;
    this.applyTotalAmount(calculatedTotal);
  }

  markTotalManualOverride(): void {
    if (this.syncingValues) {
      return;
    }

    this.manualTotalOverride = true;
  }

  markBalanceManualOverride(): void {
    if (this.syncingValues) {
      return;
    }

    this.manualBalanceOverride = true;
  }

  submit(): void {
    if (this.saving() || this.projectContextError()) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const projectId = Number(raw.projectId);
    const payload: CreateTransactionRequest = {
      projectId,
      date: raw.date,
      entryType: raw.entryType,
      vendorId: Number(raw.vendorId),
      paymentMode: raw.paymentMode,
      category: raw.category.trim(),
      subCategory: raw.subCategory.trim(),
      item: raw.item.trim(),
      quantity: this.optionalNumber(raw.quantity),
      unit: raw.unit.trim() || undefined,
      rate: this.optionalNumber(raw.rate),
      totalAmount: Number(raw.totalAmount),
      paidAmount: Number(raw.paidAmount),
      balance: Number(raw.balance),
      stageName: raw.stageName.trim() || undefined,
      receiptNo: raw.receiptNo.trim() || undefined,
      carriage: this.optionalNumber(raw.carriage),
      length: raw.length.trim() || undefined,
      comments: raw.comments.trim() || undefined
    };

    this.saving.set(true);
    this.error.set(null);

    this.transactionsService
      .createTransaction(payload)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.router.navigate(['/projects', projectId]);
        },
        error: (err: unknown) => {
          const message = this.extractErrorMessage(err);
          this.error.set(message ?? 'Failed to create transaction.');
        }
      });
  }

  selectedVendorName() {
    const vendorId = this.form.controls.vendorId.value;
    return (
      this.vendors().find((vendor) => vendor.id === vendorId)?.name ??
      'Not selected'
    );
  }

  private applyProjectContext(): void {
    const projectIdParam =
      this.route.snapshot.paramMap.get('id') ??
      this.route.snapshot.queryParamMap.get('projectId');

    if (!projectIdParam) {
      this.projectContextError.set('Open a project first to add a transaction.');
      return;
    }

    const projectId = Number(projectIdParam);
    if (!Number.isInteger(projectId) || projectId <= 0) {
      this.projectContextError.set('Invalid project context for transaction.');
      return;
    }

    this.currentProjectId.set(projectId);
    this.form.controls.projectId.setValue(projectId);
    this.loadProject(projectId);
    this.loadVendors(projectId);
  }

  private loadProject(projectId: number): void {
    this.projectsService
      .getProjectById(projectId)
      .pipe(catchError(() => of(null)))
      .subscribe((project) => {
        this.projectName.set(project?.name ?? null);
      });
  }

  private loadVendors(projectId: number): void {
    this.vendorsLoading.set(true);
    this.vendorsError.set(null);

    this.vendorsService.getVendorsByProject(projectId).subscribe({
      next: (vendors) => {
        this.vendors.set(vendors ?? []);
        this.vendorsLoading.set(false);
      },
      error: () => {
        this.vendors.set([]);
        this.vendorsError.set('Failed to load project vendors.');
        this.vendorsLoading.set(false);
      }
    });
  }

  private setupAmountLogic(): void {
    this.form.controls.quantity.valueChanges
      .pipe(startWith(this.form.controls.quantity.value), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.applyCalculatedTotalIfNeeded();
      });

    this.form.controls.rate.valueChanges
      .pipe(startWith(this.form.controls.rate.value), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.applyCalculatedTotalIfNeeded();
      });

    this.form.controls.carriage.valueChanges
      .pipe(startWith(this.form.controls.carriage.value), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.applyCalculatedTotalIfNeeded();
      });

    this.form.controls.totalAmount.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((totalAmount) => {
        if (this.syncingValues) {
          return;
        }

        this.manualBalanceOverride = false;
        this.applyBalanceFromPaid(totalAmount, this.form.controls.paidAmount.value);
      });

    this.form.controls.paidAmount.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((paidAmount) => {
        if (this.syncingValues) {
          return;
        }

        this.manualBalanceOverride = false;
        this.applyBalanceFromPaid(this.form.controls.totalAmount.value, paidAmount);
      });

    this.form.controls.balance.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((balance) => {
        if (this.syncingValues || !this.manualBalanceOverride) {
          return;
        }

        this.applyPaidFromBalance(this.form.controls.totalAmount.value, balance);
      });
  }

  private applyCalculatedTotalIfNeeded(): void {
    const calculatedTotal = this.calculatedTotal();
    if (calculatedTotal === null || this.manualTotalOverride) {
      return;
    }

    this.applyTotalAmount(calculatedTotal);
  }

  private applyTotalAmount(totalAmount: number): void {
    this.syncingValues = true;
    this.form.controls.totalAmount.setValue(this.normalizeMoney(totalAmount), {
      emitEvent: false
    });
    this.syncingValues = false;
    this.manualBalanceOverride = false;
    this.applyBalanceFromPaid(
      this.form.controls.totalAmount.value,
      this.form.controls.paidAmount.value
    );
    this.form.updateValueAndValidity({ emitEvent: false });
  }

  private applyBalanceFromPaid(totalAmount: number, paidAmount: number): void {
    const balance = this.normalizeMoney(Number(totalAmount ?? 0) - Number(paidAmount ?? 0));

    this.syncingValues = true;
    this.form.controls.balance.setValue(balance, { emitEvent: false });
    this.syncingValues = false;
    this.form.updateValueAndValidity({ emitEvent: false });
  }

  private applyPaidFromBalance(totalAmount: number, balance: number): void {
    const paidAmount = this.normalizeMoney(Number(totalAmount ?? 0) - Number(balance ?? 0));

    this.syncingValues = true;
    this.form.controls.paidAmount.setValue(paidAmount, { emitEvent: false });
    this.syncingValues = false;
    this.form.updateValueAndValidity({ emitEvent: false });
  }

  private optionalNumber(value: number | null | undefined) {
    return value === null || value === undefined || value === 0 ? undefined : Number(value);
  }

  private normalizeMoney(value: number) {
    return Number.isFinite(value) ? Number(value.toFixed(2)) : 0;
  }

  private today() {
    return new Date().toISOString().slice(0, 10);
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

    const candidate = error as {
      error?: { message?: string | string[] };
      message?: string | string[];
    };

    if (Array.isArray(candidate.error?.message)) {
      return candidate.error.message.filter(Boolean).join(', ');
    }

    if (typeof candidate.error?.message === 'string') {
      return candidate.error.message;
    }

    if (Array.isArray(candidate.message)) {
      return candidate.message.filter(Boolean).join(', ');
    }

    if (typeof candidate.message === 'string' && candidate.message.trim().length > 0) {
      return candidate.message;
    }

    return null;
  }
}
