import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { QuotationService } from '../../core/services/quotation';

interface MaterialRow {
  materialId: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: string;
  notes: string;
}

@Component({
  selector: 'app-quotation-response',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './quotation-response.html',
  styleUrl: './quotation-response.css',
})
export class QuotationResponse implements OnInit {
  private route = inject(ActivatedRoute);
  private quotationService = inject(QuotationService);

  loading = signal(false);
  submitting = signal(false);
  submitted = signal(false);
  error = signal('');

  token = '';
  orderInfo = signal<{ orderId: string; supplierName: string } | null>(null);
  materials = signal<MaterialRow[]>([]);

  async ngOnInit() {
    this.token = this.route.snapshot.paramMap.get('token') ?? '';
    if (!this.token) {
      this.error.set('Token inválido.');
      return;
    }

    this.loading.set(true);
    try {
      const data = await this.quotationService.getByToken(this.token);
      this.orderInfo.set({
        orderId: data.orderId ?? data.order?.id ?? '',
        supplierName: data.supplier?.name ?? '',
      });
      this.materials.set(
        (data.details ?? []).map((d: any) => ({
          materialId: d.material.id,
          name: d.material.name,
          description: d.material.description,
          quantity: d.quantity,
          unitPrice: '',
          notes: '',
        })),
      );
    } catch {
      this.error.set('No se pudo cargar la solicitud. El enlace puede haber expirado.');
    } finally {
      this.loading.set(false);
    }
  }

  isFormValid(): boolean {
    return this.materials().every((m) => {
      const val = parseFloat(m.unitPrice);
      return !isNaN(val) && val > 0;
    });
  }

  async submit() {
    if (!this.isFormValid()) return;
    this.submitting.set(true);
    try {
      const details = this.materials().map((m) => ({
        materialId: m.materialId,
        unitPrice: parseFloat(m.unitPrice),
        notes: m.notes || undefined,
      }));
      await this.quotationService.respondQuotation(this.token, details);
      this.submitted.set(true);
    } catch {
      this.error.set('Error al enviar la cotización. Intenta nuevamente.');
    } finally {
      this.submitting.set(false);
    }
  }
}
