import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { QuotationService, ComparisonResult } from '../../core/services/quotation';

interface Selection {
  materialId: string;
  quotationDetailId: string;
  supplierId: string;
}

@Component({
  selector: 'app-evaluations',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatCheckboxModule,
    MatTooltipModule,
  ],
  templateUrl: './evaluations.html',
  styleUrl: './evaluations.css',
})
export class Evaluations implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private quotationService = inject(QuotationService);

  loading = signal(false);
  confirming = signal(false);
  comparison = signal<ComparisonResult | null>(null);
  selections = signal<Selection[]>([]);
  orderId = '';

  async ngOnInit() {
    this.orderId = this.route.snapshot.paramMap.get('orderId') ?? '';
    if (!this.orderId) return;
    this.loading.set(true);
    try {
      const data = await this.quotationService.getComparison(this.orderId);
      this.comparison.set(data);
    } finally {
      this.loading.set(false);
    }
  }

  isSelected(materialId: string, quotationDetailId: string): boolean {
    return this.selections().some(
      (s) => s.materialId === materialId && s.quotationDetailId === quotationDetailId,
    );
  }

  toggleSelection(materialId: string, quotationDetailId: string, supplierId: string) {
    const current = this.selections();
    const alreadySelected = current.find(
      (s) => s.materialId === materialId && s.quotationDetailId === quotationDetailId,
    );
    if (alreadySelected) {
      this.selections.set(current.filter((s) => s.materialId !== materialId));
    } else {
      const withoutMaterial = current.filter((s) => s.materialId !== materialId);
      this.selections.set([...withoutMaterial, { materialId, quotationDetailId, supplierId }]);
    }
  }

  hasSelectionForMaterial(materialId: string): boolean {
    return this.selections().some((s) => s.materialId === materialId);
  }

  allMaterialsSelected(): boolean {
    const comp = this.comparison();
    if (!comp) return false;
    return comp.comparison.every((row) => this.hasSelectionForMaterial(row.material.id));
  }

  getBestPrice(prices: ComparisonResult['comparison'][0]['prices']): number {
    const valid = prices.filter((p) => p.unitPrice > 0);
    if (valid.length === 0) return 0;
    return Math.min(...valid.map((p) => p.unitPrice));
  }

  isBestPrice(price: number, prices: ComparisonResult['comparison'][0]['prices']): boolean {
    return price > 0 && price === this.getBestPrice(prices);
  }

  getPrice(
    prices: ComparisonResult['comparison'][0]['prices'],
    supplierId: string,
  ): ComparisonResult['comparison'][0]['prices'][0] | null {
    return prices.find((p) => p.supplierId === supplierId) ?? null;
  }

  async confirmSelections() {
    if (!this.allMaterialsSelected()) return;
    this.confirming.set(true);
    try {
      await this.quotationService.finalizeOrder(this.orderId, {
        selections: this.selections(),
      });
      this.router.navigate(['/quotations']);
    } catch (e) {
      console.error(e);
    } finally {
      this.confirming.set(false);
    }
  }

  goBack() {
    this.router.navigate(['/quotations']);
  }

  formatPrice(price: number): string {
    if (!price || price === 0) return '—';
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(price);
  }

  getSupplierStateClass(state: string): string {
    const map: Record<string, string> = {
      ENVIADO: 'sup-enviado',
      RESPONDIDO: 'sup-respondido',
      ACEPTADO: 'sup-aceptado',
      CONFIRMADO: 'sup-confirmado',
      RECHAZADO: 'sup-rechazado',
    };
    return map[state] ?? '';
  }

  getSupplierStateLabel(state: string): string {
    const map: Record<string, string> = {
      ENVIADO: 'Enviado',
      RESPONDIDO: 'Respondido',
      ACEPTADO: 'Aceptado',
      CONFIRMADO: 'Confirmado',
      RECHAZADO: 'Rechazado',
    };
    return map[state] ?? state;
  }
}
