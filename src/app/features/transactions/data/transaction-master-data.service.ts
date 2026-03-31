import { Injectable, Signal, computed, signal } from '@angular/core';
import { CATEGORY_SEED, ITEM_SEED, STAGE_SEED, SUB_CATEGORY_SEED } from './transaction-master-data.seed';
import { Category, Item, Stage, SubCategory } from '../models/transaction-master-data.models';

@Injectable({
  providedIn: 'root'
})
export class TransactionMasterDataService {
  private readonly categoriesState = signal<Category[]>(CATEGORY_SEED);
  private readonly subCategoriesState = signal<SubCategory[]>(SUB_CATEGORY_SEED);
  private readonly itemsState = signal<Item[]>(ITEM_SEED);
  private readonly stagesState = signal<Stage[]>(
    [...STAGE_SEED].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
  );

  readonly categories: Signal<Category[]> = this.categoriesState.asReadonly();
  readonly subCategories: Signal<SubCategory[]> = this.subCategoriesState.asReadonly();
  readonly items: Signal<Item[]> = this.itemsState.asReadonly();
  readonly stages: Signal<Stage[]> = this.stagesState.asReadonly();

  readonly activeItems = computed(() =>
    this.items().filter((item) => item.isActive !== false)
  );

  getSubCategoriesByCategory(categoryId: string): SubCategory[] {
    if (!categoryId) {
      return [];
    }

    return this.subCategories().filter((subCategory) => subCategory.categoryId === categoryId);
  }

  getItemsBySubCategory(subCategoryId: string): Item[] {
    if (!subCategoryId) {
      return [];
    }

    return this.activeItems().filter((item) => item.subCategoryId === subCategoryId);
  }

  getCategoryById(categoryId: string): Category | undefined {
    return this.categories().find((category) => category.id === categoryId);
  }

  getSubCategoryById(subCategoryId: string): SubCategory | undefined {
    return this.subCategories().find((subCategory) => subCategory.id === subCategoryId);
  }

  getItemById(itemId: string): Item | undefined {
    return this.activeItems().find((item) => item.id === itemId);
  }
}
