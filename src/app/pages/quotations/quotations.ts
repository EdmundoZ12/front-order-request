import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { OrderService, Order } from '../../core/services/order';
import { QuotationService } from '../../core/services/quotation';
import { SupplierService, Supplier } from '../../core/services/supplier';
import { CURRENT_USER } from '../../core/constants/user.constants';

@Component({
  selector: 'app-quotations',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
  ],
  templateUrl: './quotations.html',
  styleUrl: './quotations.css',
})
export class Quotations implements OnInit {
  private orderService = inject(OrderService);
  private quotationService = inject(QuotationService);
  private supplierService = inject(SupplierService);

  loading = signal(false);
  orders = signal<Order[]>([]);
  allSuppliers = signal<Supplier[]>([]);
  filteredSuppliers = signal<Supplier[]>([]);

  expandedOrderId = signal<string | null>(null);
  showRfqModal = signal(false);
  selectedOrder = signal<Order | null>(null);
  selectedSuppliers = signal<Supplier[]>([]);
  supplierSearch = '';
  sendingRfq = signal(false);

  displayedColumns = ['date', 'customer', 'materials', 'state', 'actions'];

  async ngOnInit() {
    this.loading.set(true);
    try {
      const [orders, suppliers] = await Promise.all([
        this.orderService.getOrdersByUser(CURRENT_USER.id),
        this.supplierService.findAll(),
      ]);
      this.orders.set(orders);
      this.allSuppliers.set(suppliers);
    } finally {
      this.loading.set(false);
    }
  }

  toggleExpand(orderId: string) {
    this.expandedOrderId.set(this.expandedOrderId() === orderId ? null : orderId);
  }

  isExpanded(orderId: string): boolean {
    return this.expandedOrderId() === orderId;
  }

  openRfqModal(order: Order) {
    this.selectedOrder.set(order);
    this.selectedSuppliers.set([]);
    this.supplierSearch = '';
    this.filteredSuppliers.set(this.allSuppliers());
    this.showRfqModal.set(true);
  }

  closeRfqModal() {
    this.showRfqModal.set(false);
    this.selectedOrder.set(null);
    this.selectedSuppliers.set([]);
  }

  filterSuppliers() {
    const search = this.supplierSearch.toLowerCase();
    const selected = this.selectedSuppliers().map((s) => s.id);
    this.filteredSuppliers.set(
      this.allSuppliers().filter(
        (s) =>
          !selected.includes(s.id) &&
          (s.name.toLowerCase().includes(search) || s.email.toLowerCase().includes(search)),
      ),
    );
  }

  addSupplier(supplier: Supplier) {
    if (!this.selectedSuppliers().find((s) => s.id === supplier.id)) {
      this.selectedSuppliers.update((list) => [...list, supplier]);
    }
    this.supplierSearch = '';
    this.filterSuppliers();
  }

  removeSupplier(supplierId: string) {
    this.selectedSuppliers.update((list) => list.filter((s) => s.id !== supplierId));
    this.filterSuppliers();
  }

  async sendRfq() {
    const order = this.selectedOrder();
    const suppliers = this.selectedSuppliers();
    if (!order || suppliers.length === 0) return;

    this.sendingRfq.set(true);
    try {
      await this.quotationService.create({
        orderId: order.id,
        supplierIds: suppliers.map((s) => s.id),
      });
      await this.ngOnInit();
      this.closeRfqModal();
    } catch (e) {
      console.error(e);
    } finally {
      this.sendingRfq.set(false);
    }
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
    };
    return classes[state] ?? '';
  }
}
