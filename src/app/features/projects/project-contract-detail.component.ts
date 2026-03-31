import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ProjectContractDetail } from './data-access/project-contracts.api';

@Component({
  selector: 'app-project-contract-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './project-contract-detail.component.html',
  styleUrls: ['./project-contract-detail.component.css']
})
export class ProjectContractDetailComponent {
  @Input({ required: true }) contract!: ProjectContractDetail;
  @Input() saving = false;

  @Output() closed = new EventEmitter<void>();
  @Output() paymentRequested = new EventEmitter<number | null>();

  requestContractPayment(): void {
    this.paymentRequested.emit(null);
  }

  requestMilestonePayment(milestoneId: number): void {
    this.paymentRequested.emit(milestoneId);
  }

  close(): void {
    this.closed.emit();
  }
}
