import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  Vendor,
  VendorOutstandingSummary,
  VendorsService
} from './vendors.service';

@Component({
  selector: 'app-vendors',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './vendors.component.html'
})
export class VendorsComponent implements OnInit {
  private vendorsService = inject(VendorsService);
  private route = inject(ActivatedRoute);

  loading = signal(true);
  error = signal<string | null>(null);
  attachError = signal<string | null>(null);
  attachSuccess = signal<string | null>(null);
  attachingVendorId = signal<number | null>(null);
  targetProjectId = signal<number | null>(null);
  vendors = signal<Vendor[]>([]);
  outstandingError = signal<string | null>(null);
  private outstandingByVendorId = signal<Record<number, VendorOutstandingSummary>>({});

  totals = computed(() => {
    return Object.values(this.outstandingByVendorId()).reduce(
      (acc, row) => {
        acc.totalTransactionAmount += Number(row.totalTransactionAmount ?? 0);
        acc.totalPaidAmount += Number(row.totalPaidAmount ?? 0);
        acc.totalBalance += Number(row.totalBalance ?? 0);
        return acc;
      },
      {
        totalTransactionAmount: 0,
        totalPaidAmount: 0,
        totalBalance: 0
      }
    );
  });

  get createVendorQueryParams(): { projectId: number } | undefined {
    const projectId = this.targetProjectId();
    if (!projectId) {
      return undefined;
    }

    return { projectId };
  }

  ngOnInit(): void {
    const projectParam = this.route.snapshot.queryParamMap.get('projectId');
    const projectId = Number(projectParam);

    if (Number.isFinite(projectId) && projectId > 0) {
      this.targetProjectId.set(projectId);
    }

    this.loadVendors();
    this.loadOutstandingSummary();
  }

  attachVendor(vendorId: number): void {
    const projectId = this.targetProjectId();

    if (!projectId || this.attachingVendorId()) {
      return;
    }

    this.attachingVendorId.set(vendorId);
    this.attachError.set(null);
    this.attachSuccess.set(null);

    this.vendorsService.attachVendorToProject(vendorId, projectId).subscribe({
      next: (response) => {
        const name = this.findVendorName(vendorId);
        const suffix = response.alreadyAttached ? 'already assigned' : 'assigned';
        this.attachSuccess.set(`${name} ${suffix} to project #${projectId}.`);
        this.attachingVendorId.set(null);
        this.loadVendors();
      },
      error: () => {
        this.attachError.set('Failed to attach vendor to project.');
        this.attachingVendorId.set(null);
      }
    });
  }

  canAttach(vendorId: number): boolean {
    return this.targetProjectId() !== null && this.attachingVendorId() !== vendorId;
  }

  getVendorOutstanding(vendorId: number): VendorOutstandingSummary | undefined {
    return this.outstandingByVendorId()[vendorId];
  }

  private loadVendors(): void {
    this.loading.set(true);
    this.error.set(null);

    this.vendorsService.getVendors().subscribe({
      next: (vendors) => {
        this.vendors.set(vendors ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load vendors.');
        this.loading.set(false);
      }
    });
  }

  private loadOutstandingSummary(): void {
    this.outstandingError.set(null);

    this.vendorsService.getOutstandingSummary().subscribe({
      next: (rows) => {
        const mapped = (rows ?? []).reduce<Record<number, VendorOutstandingSummary>>(
          (acc, row) => {
            acc[row.vendorId] = row;
            return acc;
          },
          {}
        );

        this.outstandingByVendorId.set(mapped);
      },
      error: () => {
        this.outstandingError.set('Failed to load vendor outstanding summary.');
        this.outstandingByVendorId.set({});
      }
    });
  }

  private findVendorName(vendorId: number): string {
    const vendor = this.vendors().find((item) => item.id === vendorId);
    return vendor?.name ?? `Vendor #${vendorId}`;
  }
}
