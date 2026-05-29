import { Injectable } from '@angular/core';
import { api } from './api';

export interface QuotationDetail {
  id: string;
  material: {
    id: string;
    name: string;
    description: string;
  };
  unitPrice: number;
  quantity: number;
  notes: string;
}

export interface Quotation {
  id: string;
  token: string;
  confirmToken: string;
  state: string;
  shippingDate: string;
  supplier: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  details: QuotationDetail[];
}

export interface ComparisonResult {
  orderId: string;
  suppliers: { id: string; name: string; state: string }[];
  comparison: {
    material: { id: string; name: string; description: string };
    prices: {
      supplierId: string;
      supplierName: string;
      quotationDetailId: string;
      unitPrice: number;
      quantity: number;
      notes: string;
      quotationState: string;
    }[];
  }[];
}

export interface CreateQuotationDto {
  orderId: string;
  supplierIds: string[];
}

export interface FinalizeOrderDto {
  selections: {
    materialId: string;
    quotationDetailId: string;
    supplierId: string;
  }[];
}

@Injectable({ providedIn: 'root' })
export class QuotationService {
  async create(dto: CreateQuotationDto): Promise<Quotation[]> {
    const res = await api.post<Quotation[]>('/quotations', dto);
    return res.data;
  }

  async getByOrder(orderId: string): Promise<Quotation[]> {
    const res = await api.get<Quotation[]>(`/quotations/by-order/${orderId}`);
    return res.data;
  }

  async getComparison(orderId: string): Promise<ComparisonResult> {
    const res = await api.get<ComparisonResult>(`/quotations/comparison/${orderId}`);
    return res.data;
  }

  async finalizeOrder(orderId: string, dto: FinalizeOrderDto): Promise<any> {
    const res = await api.post(`/quotations/finalize/${orderId}`, dto);
    return res.data;
  }

  async getByToken(token: string): Promise<any> {
    const res = await api.get(`/quotations/respond/${token}`);
    return res.data;
  }

  async respondQuotation(
    token: string,
    details: { materialId: string; unitPrice: number; notes?: string }[],
  ): Promise<any> {
    const res = await api.post(`/quotations/respond/${token}`, { details });
    return res.data;
  }

  async confirmPurchase(confirmToken: string): Promise<any> {
    const res = await api.post(`/quotations/confirm-purchase/${confirmToken}`);
    return res.data;
  }
}
