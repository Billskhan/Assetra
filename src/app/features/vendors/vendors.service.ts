import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface Vendor {
  id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
  isGlobal?: boolean | null;
  createdAt?: string | Date;
}

@Injectable({
  providedIn: 'root'
})
export class VendorsService {
  constructor(private http: HttpClient) {}

  getVendors() {
    return this.http.get<Vendor[]>('/vendors');
  }

  createVendor(payload: {
    name: string;
    email?: string;
    phone?: string;
    isGlobal?: boolean;
  }) {
    return this.http.post<Vendor>('/vendors', payload);
  }
}
