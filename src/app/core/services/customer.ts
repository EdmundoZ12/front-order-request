import { Injectable } from '@angular/core';
import { api } from './api';

export interface Customer {
  id: string;
  name: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface CreateCustomerDto {
  name: string;
  lastName: string;
  email: string;
  phone: string;
}

@Injectable({ providedIn: 'root' })
export class CustomerService {
  async findByEmail(email: string): Promise<Customer | null> {
    try {
      const res = await api.get<Customer>(`/auth/customers/${email}`);
      if (!res.data || !res.data.id) return null;
      return res.data;
    } catch {
      return null;
    }
  }
  async create(dto: CreateCustomerDto): Promise<Customer> {
    const res = await api.post<Customer>('/auth/create-customer', dto);
    return res.data;
  }
}
