import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';
import {
  getMockProjectById,
  PortfolioProject,
  ProjectTransaction,
  ProjectVendor
} from '../../core/mock/portfolio.mock';
import { Transaction } from '../transactions/transactions.models';
import { TransactionsService } from '../transactions/transactions.service';
import { Vendor, VendorsService } from '../vendors/vendors.service';
import { ContractPaymentFormComponent } from './contract-payment-form.component';
import {
  ProjectContractSummary
} from './data-access/project-contracts.api';
import { ProjectContractsStore } from './data-access/project-contracts.store';
import { ProjectContractDetailComponent } from './project-contract-detail.component';
import { ProjectContractFormComponent } from './project-contract-form.component';
import { Project } from './projects.models';
import { ProjectsService } from './projects.service';

@Component({
  selector: 'app-project-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ProjectContractFormComponent,
    ProjectContractDetailComponent,
    ContractPaymentFormComponent
  ],
  providers: [ProjectContractsStore],
  templateUrl: './project-dashboard.component.html',
  styleUrls: ['./project-dashboard.component.css']
})
export class ProjectDashboardComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private projectsService = inject(ProjectsService);
  private vendorsService = inject(VendorsService);
  private transactionsService = inject(TransactionsService);
  readonly contractsStore = inject(ProjectContractsStore);

  private projectId: number | null = null;
  project = signal<PortfolioProject | null>(null);
  showContractForm = signal(false);
  showContractDetail = signal(false);
  showPaymentForm = signal(false);
  paymentMilestoneId = signal<number | null>(null);

  assignedVendorOptions = computed(() => {
    const vendors = this.project()?.vendors ?? [];
    return vendors.map((vendor) => ({ id: vendor.id, name: vendor.name }));
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isFinite(id)) {
      this.project.set(null);
      return;
    }

    this.projectId = id;
    void this.contractsStore.loadContracts(id);

    this.projectsService
      .getProjectById(id)
      .pipe(catchError(() => of(null)))
      .subscribe((project) => {
        if (project) {
          this.project.set(this.mapApiProject(project));
          this.loadAssignedVendors(id);
          this.loadProjectTransactions(id);
          return;
        }

        this.project.set(getMockProjectById(id));
        this.loadAssignedVendors(id);
        this.loadProjectTransactions(id);
      });
  }

  addVendor(): void {
    if (!this.projectId) {
      return;
    }

    this.router.navigate(['/vendors'], {
      queryParams: { projectId: this.projectId }
    });
  }

  removeVendor(): void {
    if (!this.projectId) {
      return;
    }

    this.router.navigate(['/vendors'], {
      queryParams: { projectId: this.projectId }
    });
  }

  createContract(): void {
    this.showContractForm.set(true);
  }

  closeContractForm(): void {
    this.showContractForm.set(false);
  }

  onContractSaved(): void {
    this.showContractForm.set(false);
    const selected = this.contractsStore.selectedContract();
    if (selected) {
      this.showContractDetail.set(true);
    }
  }

  async openContract(contractId: number): Promise<void> {
    this.showContractDetail.set(true);
    await this.contractsStore.openContract(contractId);
  }

  closeContractDetail(): void {
    this.showContractDetail.set(false);
    this.showPaymentForm.set(false);
    this.paymentMilestoneId.set(null);
    this.contractsStore.clearSelectedContract();
  }

  openPaymentForm(milestoneId: number | null): void {
    this.paymentMilestoneId.set(milestoneId);
    this.showPaymentForm.set(true);
  }

  closePaymentForm(): void {
    this.showPaymentForm.set(false);
    this.paymentMilestoneId.set(null);
  }

  onPaymentSaved(): void {
    this.closePaymentForm();
  }

  addTransaction(): void {
    if (!this.projectId) {
      return;
    }

    this.router.navigate(['/projects', this.projectId, 'transactions', 'add']);
  }

  trackByContractId(_: number, contract: ProjectContractSummary): number {
    return contract.id;
  }

  private loadAssignedVendors(projectId: number): void {
    this.vendorsService
      .getVendorsByProject(projectId)
      .pipe(catchError(() => of([] as Vendor[])))
      .subscribe((vendors) => {
        const current = this.project();
        if (!current) {
          return;
        }

        const mappedVendors = vendors.map((vendor) => this.mapProjectVendor(vendor));

        this.project.set({
          ...current,
          vendors: mappedVendors,
          transactions: current.transactions.map((transaction) => ({
            ...transaction,
            vendorName:
              mappedVendors.find((vendor) => vendor.id === transaction.vendorId)
                ?.name ?? transaction.vendorName
          }))
        });
      });
  }

  private loadProjectTransactions(projectId: number): void {
    this.transactionsService
      .getTransactionsByProject(projectId)
      .pipe(catchError(() => of([] as Transaction[])))
      .subscribe((transactions) => {
        const current = this.project();
        if (!current) {
          return;
        }

        this.project.set({
          ...current,
          transactions: transactions.map((transaction) =>
            this.mapProjectTransaction(transaction)
          )
        });
      });
  }

  private mapProjectVendor(vendor: Vendor): ProjectVendor {
    return {
      id: vendor.id,
      name: vendor.name,
      category: vendor.isGlobal ? 'Global Vendor' : 'Project Vendor',
      status: 'Active'
    };
  }

  private mapProjectTransaction(transaction: Transaction): ProjectTransaction {
    const vendorName =
      this.project()
        ?.vendors.find((vendor) => vendor.id === transaction.vendorId)?.name ??
      `Vendor #${transaction.vendorId}`;

    return {
      id: Number(transaction.id),
      date: String(transaction.date),
      vendorId: transaction.vendorId,
      vendorName,
      entryType: transaction.entryType,
      category: transaction.category,
      subCategory: transaction.subCategory,
      item: transaction.item,
      paymentMode: transaction.paymentMode,
      totalAmount: Number(transaction.totalAmount ?? 0),
      paidAmount: Number(transaction.paidAmount ?? 0),
      balance: Number(transaction.balance ?? 0),
      comments: transaction.comments ?? undefined
    };
  }

  private mapApiProject(project: Project): PortfolioProject {
    return {
      id: project.id,
      name: project.name,
      description: project.description ?? 'No description provided.',
      location: project.location ?? 'TBD',
      startDate: project.startDate ? String(project.startDate) : '',
      endDate: project.endDate ? String(project.endDate) : '',
      budget: project.budget ?? 0,
      status: this.getStatus(project),
      vendors: [],
      contracts: [],
      transactions: []
    };
  }

  private getStatus(project: Project): string {
    const now = Date.now();
    const start = project.startDate ? new Date(project.startDate).getTime() : null;
    const end = project.endDate ? new Date(project.endDate).getTime() : null;

    if (end && end < now) {
      return 'Completed';
    }

    if (start && start > now) {
      return 'Planned';
    }

    return 'Active';
  }
}
