import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Vendor, VendorsService } from './vendors.service';

@Component({
  selector: 'app-vendors',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './vendors.component.html'
})
export class VendorsComponent implements OnInit {
  private vendorsService = inject(VendorsService);

  loading = signal(true);
  error = signal<string | null>(null);
  vendors = signal<Vendor[]>([]);

  ngOnInit(): void {
    this.loadVendors();
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
}
