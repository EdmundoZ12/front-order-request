import { Injectable } from '@angular/core';
import { api } from './api';
import { CURRENT_USER } from '../constants/user.constants';

export interface CreateOrderDto {
  customerId: string;
  materials: {
    materialId: string;
    quantity: number;
  }[];
}

export interface Order {
  id: string;
  state: string;
  version: number;
  dateOrdered: string;
  customer: {
    id: string;
    name: string;
    lastName: string;
    email: string;
    phone: string;
  };
  orderDetails: {
    id: string;
    quantity: number;
    material: {
      id: string;
      name: string;
      description: string;
    };
  }[];
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  async create(dto: CreateOrderDto): Promise<Order> {
    const res = await api.post<Order>('/orders', dto);
    return res.data;
  }

  async getPendingOrders(): Promise<Order[]> {
    const res = await api.get<Order[]>('/orders/pending');
    return res.data;
  }

  async getOrdersByUser(userId: string): Promise<Order[]> {
    const res = await api.get<Order[]>(`/orders/by-user/${userId}`);
    return res.data;
  }

  async takeOrder(orderId: string): Promise<Order> {
    const res = await api.post<Order>(`/orders/${orderId}/change-state`, {
      newState: 'EN_PROCESO',
      userId: CURRENT_USER.id,
    });
    return res.data;
  }
}
