import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { OrderService, Order } from '../../core/services/order';
import { QuotationService, Quotation } from '../../core/services/quotation';
import { CURRENT_USER } from '../../core/constants/user.constants';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatSelectModule,
    MatFormFieldModule,
  ],
  templateUrl: './orders.html',
  styleUrl: './orders.css',
})
export class Orders implements OnInit {
  private orderService = inject(OrderService);
  private quotationService = inject(QuotationService);

  loading = signal(false);
  allOrders = signal<Order[]>([]);
  filteredOrders = signal<Order[]>([]);
  selectedOrder = signal<Order | null>(null);
  quotations = signal<Quotation[]>([]);
  loadingDetail = signal(false);
  filterState = 'ALL';

  displayedColumns = ['date', 'customer', 'materials', 'state', 'actions'];

  stateOptions = [
    { value: 'ALL', label: 'Todos' },
    { value: 'EN_PROCESO', label: 'En proceso' },
    { value: 'EN_COTIZACION', label: 'En cotización' },
    { value: 'EN_EVALUACION_ECONOMICA', label: 'En evaluación' },
    { value: 'SELECCIONADO', label: 'Seleccionado' },
    { value: 'FINALIZADO', label: 'Finalizado' },
    { value: 'RECHAZADO', label: 'Rechazado' },
  ];

  async ngOnInit() {
    this.loading.set(true);
    try {
      const orders = await this.orderService.getOrdersByUser(CURRENT_USER.id);
      this.allOrders.set(orders);
      this.applyFilter();
    } finally {
      this.loading.set(false);
    }
  }

  applyFilter() {
    const all = this.allOrders();
    this.filteredOrders.set(
      this.filterState === 'ALL' ? all : all.filter((o) => o.state === this.filterState),
    );
  }

  async openDetail(order: Order) {
    this.selectedOrder.set(order);
    this.quotations.set([]);
    this.loadingDetail.set(true);
    try {
      const qs = await this.quotationService.getByOrder(order.id);
      this.quotations.set(qs);
    } finally {
      this.loadingDetail.set(false);
    }
  }

  closeDetail() {
    this.selectedOrder.set(null);
    this.quotations.set([]);
  }

  getInitials(name: string, lastName: string): string {
    return `${name[0]}${lastName[0]}`.toUpperCase();
  }

  getStateLabel(state: string): string {
    const labels: Record<string, string> = {
      EN_PROCESO: 'En proceso',
      EN_COTIZACION: 'En cotización',
      EN_EVALUACION_ECONOMICA: 'En evaluación',
      SELECCIONADO: 'Seleccionado',
      FINALIZADO: 'Finalizado',
      RECHAZADO: 'Rechazado',
    };
    return labels[state] ?? state;
  }

  getStateClass(state: string): string {
    const classes: Record<string, string> = {
      EN_PROCESO: 'state-proceso',
      EN_COTIZACION: 'state-cotizacion',
      EN_EVALUACION_ECONOMICA: 'state-evaluacion',
      SELECCIONADO: 'state-seleccionado',
      FINALIZADO: 'state-finalizado',
      RECHAZADO: 'state-rechazado',
    };
    return classes[state] ?? '';
  }

  getQuotationStateLabel(state: string): string {
    const labels: Record<string, string> = {
      ENVIADO: 'Enviado',
      RESPONDIDO: 'Respondido',
      ACEPTADO: 'Aceptado',
      CONFIRMADO: 'Confirmado',
      RECHAZADO: 'Rechazado',
    };
    return labels[state] ?? state;
  }

  getQuotationStateClass(state: string): string {
    const classes: Record<string, string> = {
      ENVIADO: 'qs-enviado',
      RESPONDIDO: 'qs-respondido',
      ACEPTADO: 'qs-aceptado',
      CONFIRMADO: 'qs-confirmado',
      RECHAZADO: 'qs-rechazado',
    };
    return classes[state] ?? '';
  }

  formatPrice(price: number): string {
    if (!price) return '—';
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(price);
  }

  getTotalForQuotation(q: Quotation): number {
    return q.details.reduce((sum, d) => sum + d.unitPrice * d.quantity, 0);
  }
}
