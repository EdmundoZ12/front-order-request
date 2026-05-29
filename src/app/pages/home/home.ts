import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { OrderService, Order } from '../../core/services/order';
import { CURRENT_USER } from '../../core/constants/user.constants';

interface KpiCard {
  label: string;
  count: number;
  icon: string;
  colorClass: string;
  route: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatProgressSpinnerModule, MatButtonModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  private orderService = inject(OrderService);

  loading = signal(false);
  kpis = signal<KpiCard[]>([]);

  async ngOnInit() {
    this.loading.set(true);
    try {
      const orders = await this.orderService.getOrdersByUser(CURRENT_USER.id);
      this.kpis.set([
        {
          label: 'En proceso',
          count: orders.filter((o) => o.state === 'EN_PROCESO').length,
          icon: 'pending_actions',
          colorClass: 'kpi-proceso',
          route: '/quotations',
        },
        {
          label: 'En cotización',
          count: orders.filter((o) => o.state === 'EN_COTIZACION').length,
          icon: 'request_quote',
          colorClass: 'kpi-cotizacion',
          route: '/quotations',
        },
        {
          label: 'En evaluación',
          count: orders.filter((o) => o.state === 'EN_EVALUACION_ECONOMICA').length,
          icon: 'compare_arrows',
          colorClass: 'kpi-evaluacion',
          route: '/quotations',
        },
        {
          label: 'Finalizados',
          count: orders.filter((o) => o.state === 'FINALIZADO').length,
          icon: 'check_circle',
          colorClass: 'kpi-finalizado',
          route: '/orders',
        },
      ]);
    } finally {
      this.loading.set(false);
    }
  }
}
