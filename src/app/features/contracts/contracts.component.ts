import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { Contract } from './contracts.models';
import { ContractsService } from './contracts.service';

@Component({
  selector: 'app-contracts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contracts.component.html',
  styleUrls: ['./contracts.component.css']
})
export class ContractsComponent implements OnInit {
  private contractsService = inject(ContractsService);

  loading = signal(true);
  error = signal<string | null>(null);
  contracts = signal<Contract[]>([]);

  ngOnInit(): void {
    this.loadContracts();
  }

  private loadContracts(): void {
    this.loading.set(true);
    this.error.set(null);

    this.contractsService.getContracts().subscribe({
      next: (contracts) => {
        this.contracts.set(contracts ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load contracts.');
        this.loading.set(false);
      }
    });
  }
}
