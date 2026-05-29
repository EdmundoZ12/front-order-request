import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { OrderService, Order } from '../../core/services/order';

@Component({
  selector: 'app-requests',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatTooltipModule,
  ],
  templateUrl: './requests.html',
  styleUrl: './requests.css',
})
export class Requests implements OnInit {
  private orderService = inject(OrderService);

  loading = signal(false);
  takingOrderId = signal<string | null>(null);
  pendingOrders = signal<Order[]>([]);

  displayedColumns = ['date', 'customer', 'materials', 'actions'];

  async ngOnInit() {
    await this.loadOrders();
  }

  async loadOrders() {
    this.loading.set(true);
    try {
      this.pendingOrders.set(await this.orderService.getPendingOrders());
    } catch (e) {
      console.error(e);
    } finally {
      this.loading.set(false);
    }
  }

  async takeOrder(orderId: string) {
    this.takingOrderId.set(orderId);
    try {
      await this.orderService.takeOrder(orderId);
      await this.loadOrders();
    } catch (e) {
      console.error(e);
    } finally {
      this.takingOrderId.set(null);
    }
  }

  getInitials(name: string, lastName: string): string {
    return `${name[0]}${lastName[0]}`.toUpperCase();
  }
}
