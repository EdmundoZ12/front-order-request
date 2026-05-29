import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { QuotationService } from '../../core/services/quotation';

@Component({
  selector: 'app-confirm-purchase',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './confirm-purchase.html',
  styleUrl: './confirm-purchase.css',
})
export class ConfirmPurchase implements OnInit {
  private route = inject(ActivatedRoute);
  private quotationService = inject(QuotationService);

  loading = signal(true);
  confirmed = signal(false);
  error = signal('');

  async ngOnInit() {
    const token = this.route.snapshot.paramMap.get('confirmToken') ?? '';
    if (!token) {
      this.error.set('Token inválido.');
      this.loading.set(false);
      return;
    }

    try {
      await this.quotationService.confirmPurchase(token);
      this.confirmed.set(true);
    } catch {
      this.error.set(
        'No se pudo confirmar la orden. El enlace puede haber expirado o ya fue utilizado.',
      );
    } finally {
      this.loading.set(false);
    }
  }
}
