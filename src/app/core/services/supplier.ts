import { Injectable } from '@angular/core';
import { api } from './api';

export interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
}

@Injectable({ providedIn: 'root' })
export class SupplierService {
  async findAll(): Promise<Supplier[]> {
    const res = await api.get<Supplier[]>('/suppliers');
    return res.data;
  }
}
