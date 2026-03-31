import { CommonModule } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize, startWith } from 'rxjs';
import { TransactionFacadeService } from '../data/transaction-facade.service';
import { TransactionMasterDataService } from '../data/transaction-master-data.service';
import {
  TransactionCreatePayload,
  TransactionEntryType,
  TransactionPaymentMode
} from '../models/transaction-master-data.models';

type TransactionCreateForm = FormGroup<{
  projectId: FormControl<string>;
  date: FormControl<string>;
  stageId: FormControl<string>;
  entryType: FormControl<TransactionEntryType>;
  categoryId: FormControl<string>;
  subCategoryId: FormControl<string>;
  itemId: FormControl<string | null>;
  itemNotFound: FormControl<boolean>;
  customItemText: FormControl<string | null>;
  vendorId: FormControl<string | null>;
  quantity: FormControl<number | null>;
  unit: FormControl<string | null>;
  rate: FormControl<number | null>;
  carriage: FormControl<number | null>;
  totalAmount: FormControl<number>;
  paidAmount: FormControl<number | null>;
  balanceAmount: FormControl<number | null>;
  paymentMode: FormControl<TransactionPaymentMode | null>;
  comments: FormControl<string | null>;
}>;

@Component({
  selector: 'app-transaction-create-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './transaction-create-page.component.html',
  styleUrls: ['./transaction-create-page.component.css']
})
export class TransactionCreatePageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly masterData = inject(TransactionMasterDataService);
  private readonly transactionFacade = inject(TransactionFacadeService);

  readonly submitInProgress = signal(false);
  readonly submitError = signal<string | null>(null);
  readonly submitSuccessId = signal<string | null>(null);

  readonly selectedCategoryId = signal('');
  readonly selectedSubCategoryId = signal('');

  readonly categories = this.masterData.categories;
  readonly stages = this.masterData.stages;
  readonly filteredSubCategories = computed(() =>
    this.masterData.getSubCategoriesByCategory(this.selectedCategoryId())
  );
  readonly filteredItems = computed(() =>
    this.masterData.getItemsBySubCategory(this.selectedSubCategoryId())
  );

  readonly classificationPreview = computed(() => {
    const category = this.masterData.getCategoryById(this.form.controls.categoryId.value);
    const subCategory = this.masterData.getSubCategoryById(
      this.form.controls.subCategoryId.value
    );
    const item = this.masterData.getItemById(this.form.controls.itemId.value ?? '');
    const custom = this.form.controls.customItemText.value?.trim() ?? '';

    return {
      categoryName: category?.name ?? '-',
      subCategoryName: subCategory?.name ?? '-',
      itemName: custom || item?.name || '-'
    };
  });

  readonly entryTypeOptions: TransactionEntryType[] = ['SERVICE', 'MATERIAL'];
  readonly paymentModeOptions: TransactionPaymentMode[] = [
    'CASH',
    'BANK',
    'ONLINE',
    'CHEQUE',
    'CREDIT',
    'ADVANCE'
  ];

  readonly form: TransactionCreateForm = this.fb.group({
    projectId: this.fb.nonNullable.control('', Validators.required),
    date: this.fb.nonNullable.control(this.today(), Validators.required),
    stageId: this.fb.nonNullable.control('', Validators.required),
    entryType: this.fb.nonNullable.control<TransactionEntryType>('MATERIAL', Validators.required),
    categoryId: this.fb.nonNullable.control('', Validators.required),
    subCategoryId: this.fb.nonNullable.control('', Validators.required),
    itemId: this.fb.control<string | null>(null),
    itemNotFound: this.fb.nonNullable.control(false),
    customItemText: this.fb.control<string | null>({ value: null, disabled: true }),
    vendorId: this.fb.control<string | null>(null),
    quantity: this.fb.control<number | null>(null),
    unit: this.fb.control<string | null>(null),
    rate: this.fb.control<number | null>(null),
    carriage: this.fb.control<number | null>(null),
    totalAmount: this.fb.nonNullable.control(0, [Validators.required, Validators.min(0.01)]),
    paidAmount: this.fb.control<number | null>(null),
    balanceAmount: this.fb.control<number | null>(0),
    paymentMode: this.fb.control<TransactionPaymentMode | null>(null),
    comments: this.fb.control<string | null>(null)
  });

  constructor() {
    this.applyProjectContext();
    this.setupDependentDropdowns();
    this.setupCustomItemLogic();
    this.setupAmountCalculations();
    this.setupDefaultUnitFromItem();
  }

  async submit(): Promise<void> {
    if (this.submitInProgress()) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const isCustomItem = raw.itemNotFound;

    const payload: TransactionCreatePayload = {
      projectId: raw.projectId,
      stageId: raw.stageId,
      categoryId: raw.categoryId,
      subCategoryId: raw.subCategoryId,
      itemId: isCustomItem ? null : raw.itemId,
      customItemText: isCustomItem ? this.toOptionalString(raw.customItemText) : null,
      vendorId: this.toOptionalString(raw.vendorId),
      date: raw.date,
      entryType: raw.entryType,
      quantity: this.toOptionalNumber(raw.quantity),
      unit: this.toOptionalString(raw.unit),
      rate: this.toOptionalNumber(raw.rate),
      carriage: this.toOptionalNumber(raw.carriage),
      totalAmount: Number(raw.totalAmount),
      paidAmount: this.toOptionalNumber(raw.paidAmount),
      balanceAmount: this.toOptionalNumber(raw.balanceAmount),
      paymentMode: raw.paymentMode,
      comments: this.toOptionalString(raw.comments)
    };

    this.submitInProgress.set(true);
    this.submitError.set(null);
    this.submitSuccessId.set(null);

    this.transactionFacade
      .createTransaction(payload)
      .pipe(finalize(() => this.submitInProgress.set(false)))
      .subscribe({
        next: (response) => {
          this.submitSuccessId.set(response.id);
          const routeProjectId = this.route.snapshot.paramMap.get('id');
          if (routeProjectId) {
            this.router.navigate(['/projects', routeProjectId]);
          }
        },
        error: () => {
          this.submitError.set('Failed to create transaction. Please try again.');
        }
      });
  }

  resetForm(): void {
    const projectId = this.form.controls.projectId.value;

    this.form.reset({
      projectId,
      date: this.today(),
      stageId: '',
      entryType: 'MATERIAL',
      categoryId: '',
      subCategoryId: '',
      itemId: null,
      itemNotFound: false,
      customItemText: null,
      vendorId: null,
      quantity: null,
      unit: null,
      rate: null,
      carriage: null,
      totalAmount: 0,
      paidAmount: null,
      balanceAmount: 0,
      paymentMode: null,
      comments: null
    });

    this.selectedCategoryId.set('');
    this.selectedSubCategoryId.set('');
    this.form.controls.customItemText.disable({ emitEvent: false });
    this.form.controls.itemId.enable({ emitEvent: false });
    this.submitError.set(null);
    this.submitSuccessId.set(null);
  }

  private applyProjectContext(): void {
    const routeProjectId =
      this.route.snapshot.paramMap.get('id') ??
      this.route.snapshot.queryParamMap.get('projectId');

    this.form.controls.projectId.setValue(routeProjectId?.trim() || 'PROJECT-001');
  }

  private setupDependentDropdowns(): void {
    let previousCategory = this.form.controls.categoryId.value;
    this.form.controls.categoryId.valueChanges
      .pipe(startWith(previousCategory), takeUntilDestroyed(this.destroyRef))
      .subscribe((categoryId) => {
        this.selectedCategoryId.set(categoryId);

        if (categoryId !== previousCategory) {
          this.form.patchValue(
            {
              subCategoryId: '',
              itemId: null,
              itemNotFound: false,
              customItemText: null
            },
            { emitEvent: false }
          );
          this.form.controls.customItemText.disable({ emitEvent: false });
          this.form.controls.itemId.enable({ emitEvent: false });
          this.selectedSubCategoryId.set('');
          previousCategory = categoryId;
        }
      });

    let previousSubCategory = this.form.controls.subCategoryId.value;
    this.form.controls.subCategoryId.valueChanges
      .pipe(startWith(previousSubCategory), takeUntilDestroyed(this.destroyRef))
      .subscribe((subCategoryId) => {
        this.selectedSubCategoryId.set(subCategoryId);

        if (subCategoryId !== previousSubCategory) {
          this.form.patchValue(
            {
              itemId: null,
              itemNotFound: false,
              customItemText: null
            },
            { emitEvent: false }
          );
          this.form.controls.customItemText.disable({ emitEvent: false });
          this.form.controls.itemId.enable({ emitEvent: false });
          previousSubCategory = subCategoryId;
        }
      });
  }

  private setupCustomItemLogic(): void {
    this.form.controls.itemNotFound.valueChanges
      .pipe(startWith(this.form.controls.itemNotFound.value), takeUntilDestroyed(this.destroyRef))
      .subscribe((isChecked) => {
        if (isChecked) {
          this.form.controls.itemId.setValue(null, { emitEvent: false });
          this.form.controls.itemId.disable({ emitEvent: false });
          this.form.controls.customItemText.enable({ emitEvent: false });
          this.form.controls.customItemText.setValidators([
            Validators.required,
            Validators.minLength(2)
          ]);
        } else {
          this.form.controls.itemId.enable({ emitEvent: false });
          this.form.controls.customItemText.reset(null, { emitEvent: false });
          this.form.controls.customItemText.disable({ emitEvent: false });
          this.form.controls.customItemText.clearValidators();
        }

        this.form.controls.customItemText.updateValueAndValidity({ emitEvent: false });
      });
  }

  private setupAmountCalculations(): void {
    this.form.controls.quantity.valueChanges
      .pipe(startWith(this.form.controls.quantity.value), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.applyCalculatedTotal());

    this.form.controls.rate.valueChanges
      .pipe(startWith(this.form.controls.rate.value), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.applyCalculatedTotal());

    this.form.controls.carriage.valueChanges
      .pipe(startWith(this.form.controls.carriage.value), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.applyCalculatedTotal());

    this.form.controls.totalAmount.valueChanges
      .pipe(startWith(this.form.controls.totalAmount.value), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.updateBalanceAmount());

    this.form.controls.paidAmount.valueChanges
      .pipe(startWith(this.form.controls.paidAmount.value), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.updateBalanceAmount());
  }

  private setupDefaultUnitFromItem(): void {
    this.form.controls.itemId.valueChanges
      .pipe(startWith(this.form.controls.itemId.value), takeUntilDestroyed(this.destroyRef))
      .subscribe((itemId) => {
        if (!itemId) {
          return;
        }

        const selectedItem = this.masterData.getItemById(itemId);
        if (!selectedItem?.defaultUnit || this.form.controls.unit.value) {
          return;
        }

        this.form.controls.unit.setValue(selectedItem.defaultUnit, { emitEvent: false });
      });
  }

  private applyCalculatedTotal(): void {
    const quantity = this.form.controls.quantity.value;
    const rate = this.form.controls.rate.value;

    if (quantity === null || rate === null) {
      return;
    }

    const carriage = this.form.controls.carriage.value ?? 0;
    const calculatedTotal = Number(quantity) * Number(rate) + Number(carriage);
    const normalized = this.roundMoney(calculatedTotal);

    this.form.controls.totalAmount.setValue(normalized, { emitEvent: false });
    this.updateBalanceAmount();
  }

  private updateBalanceAmount(): void {
    const totalAmount = Number(this.form.controls.totalAmount.value ?? 0);
    const paidAmount = Number(this.form.controls.paidAmount.value ?? 0);
    const balance = this.roundMoney(totalAmount - paidAmount);
    this.form.controls.balanceAmount.setValue(balance, { emitEvent: false });
  }

  private toOptionalString(value: string | null): string | null {
    const trimmed = value?.trim() ?? '';
    return trimmed ? trimmed : null;
  }

  private toOptionalNumber(value: number | null): number | null {
    if (value === null || value === undefined) {
      return null;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  private roundMoney(value: number): number {
    if (!Number.isFinite(value)) {
      return 0;
    }

    return Number(value.toFixed(2));
  }

  private today(): string {
    return new Date().toISOString().slice(0, 10);
  }
}
