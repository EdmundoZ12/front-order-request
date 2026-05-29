import { Injectable } from '@angular/core';
import { api } from './api';

export interface Material {
  id: string;
  name: string;
  description: string;
  price: number;
}

@Injectable({ providedIn: 'root' })
export class MaterialService {
  async findAll(): Promise<Material[]> {
    const res = await api.get<Material[]>('/materials');
    return res.data;
  }
}
