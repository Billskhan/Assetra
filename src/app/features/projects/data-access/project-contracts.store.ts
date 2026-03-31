import { Injectable, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import {
  CreateProjectContractPayload,
  ProjectContractDetail,
  ProjectContractSummary,
  ProjectContractsApi,
  RecordProjectContractPaymentPayload
} from './project-contracts.api';

@Injectable()
export class ProjectContractsStore {
  private readonly currentProjectId = signal<number | null>(null);

  readonly contracts = signal<ProjectContractSummary[]>([]);
  readonly selectedContract = signal<ProjectContractDetail | null>(null);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  constructor(private readonly api: ProjectContractsApi) {}

  async loadContracts(projectId: number): Promise<void> {
    this.currentProjectId.set(projectId);
    this.loading.set(true);
    this.error.set(null);

    try {
      const contracts = await firstValueFrom(
        this.api.getProjectContracts(projectId)
      );
      this.contracts.set(contracts ?? []);
    } catch (error) {
      this.error.set(this.parseError(error, 'Failed to load contracts.'));
      this.contracts.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  async openContract(contractId: number): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const contract = await firstValueFrom(this.api.getContractById(contractId));
      this.selectedContract.set(contract);
    } catch (error) {
      this.error.set(this.parseError(error, 'Failed to load contract detail.'));
      this.selectedContract.set(null);
    } finally {
      this.loading.set(false);
    }
  }

  clearSelectedContract(): void {
    this.selectedContract.set(null);
  }

  async createContract(payload: CreateProjectContractPayload): Promise<boolean> {
    this.saving.set(true);
    this.error.set(null);

    try {
      const created = await firstValueFrom(this.api.createContract(payload));
      const projectId = this.currentProjectId() ?? payload.projectId;
      await this.loadContracts(projectId);

      if (created?.id) {
        await this.openContract(created.id);
      }

      return true;
    } catch (error) {
      this.error.set(this.parseError(error, 'Failed to create contract.'));
      return false;
    } finally {
      this.saving.set(false);
    }
  }

  async recordPayment(
    payload: RecordProjectContractPaymentPayload
  ): Promise<boolean> {
    this.saving.set(true);
    this.error.set(null);

    try {
      await firstValueFrom(this.api.recordPayment(payload));
      const selected = this.selectedContract();

      if (selected) {
        await this.openContract(selected.id);
      }

      const projectId = this.currentProjectId();
      if (projectId) {
        await this.loadContracts(projectId);
      }

      return true;
    } catch (error) {
      this.error.set(this.parseError(error, 'Failed to record payment.'));
      return false;
    } finally {
      this.saving.set(false);
    }
  }

  private parseError(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      const message =
        (typeof error.error === 'object' &&
          error.error !== null &&
          'message' in error.error &&
          (Array.isArray(error.error.message)
            ? error.error.message.join(', ')
            : String(error.error.message))) ||
        error.message;

      return message || fallback;
    }

    return fallback;
  }
}
