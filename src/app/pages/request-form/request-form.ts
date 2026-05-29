import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { CustomerService, Customer } from '../../core/services/customer';
import { MaterialService, Material } from '../../core/services/material';
import { OrderService } from '../../core/services/order';
import { SuccessDialogComponent } from './success-dialog/success-dialog';

@Component({
  selector: 'app-request-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatTableModule,
    MatDialogModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './request-form.html',
  styleUrl: './request-form.css',
})
export class RequestForm implements OnInit {
  private fb = inject(FormBuilder);
  private customerService = inject(CustomerService);
  private materialService = inject(MaterialService);
  private orderService = inject(OrderService);
  private dialog = inject(MatDialog);

  searching = signal(false);
  submitting = signal(false);
  customerFound = signal(false);
  existingCustomer = signal<Customer | null>(null);

  materials = signal<Material[]>([]);
  selectedItems = signal<{ material: Material; quantity: number }[]>([]);
  displayedColumns = ['name', 'description', 'quantity', 'actions'];

  searchForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  customerForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
  });

  materialForm: FormGroup = this.fb.group({
    materialId: ['', Validators.required],
    quantity: [1, [Validators.required, Validators.min(1)]],
  });

  async ngOnInit() {
    const mats = await this.materialService.findAll();
    this.materials.set(mats);
  }

  async searchCustomer() {
    if (this.searchForm.invalid) return;
    this.searching.set(true);
    const email = this.searchForm.value.email;
    const customer = await this.customerService.findByEmail(email);
    this.searching.set(false);

    if (customer) {
      this.customerFound.set(true);
      this.existingCustomer.set(customer);
      this.customerForm.enable();
      this.customerForm.patchValue({
        name: customer.name,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone,
      });
      this.customerForm.disable();
    } else {
      this.customerFound.set(false);
      this.existingCustomer.set(null);
      this.customerForm.enable();
      this.customerForm.reset();
      this.customerForm.patchValue({ email });
    }
  }

  addMaterial() {
    if (this.materialForm.invalid) return;
    const { materialId, quantity } = this.materialForm.value;
    const material = this.materials().find((m) => m.id === materialId);
    if (!material) return;

    const exists = this.selectedItems().find((i) => i.material.id === materialId);
    if (exists) {
      this.selectedItems.update((items) =>
        items.map((i) =>
          i.material.id === materialId ? { ...i, quantity: i.quantity + quantity } : i,
        ),
      );
    } else {
      this.selectedItems.update((items) => [...items, { material, quantity }]);
    }
    this.materialForm.reset({ quantity: 1 });
  }

  removeItem(materialId: string) {
    this.selectedItems.update((items) => items.filter((i) => i.material.id !== materialId));
  }

  async confirmOrder() {
    if (this.submitting()) return;
    this.submitting.set(true);

    try {
      let customerId = this.existingCustomer()?.id;

      if (!customerId) {
        const newCustomer = await this.customerService.create(this.customerForm.value);
        customerId = newCustomer.id;
      }

      const order = await this.orderService.create({
        customerId,
        materials: this.selectedItems().map((i) => ({
          materialId: i.material.id,
          quantity: i.quantity,
        })),
      });

      this.dialog.open(SuccessDialogComponent, {
        data: { orderId: order.id },
        width: '400px',
        disableClose: true,
      });
    } catch (e) {
      console.error(e);
    } finally {
      this.submitting.set(false);
    }
  }
}
