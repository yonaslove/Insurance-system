import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { InsuranceDataService } from '../../../core/services/insurance-data.service';
import { PaymentCreateRequest } from '../../../core/models/payment.model';
import { CardComponent } from '../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';

@Component({
  selector: 'app-payment-create',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, CardComponent, ButtonComponent],
  templateUrl: './payment-create.component.html',
  styleUrl: './payment-create.component.css'
})
export class PaymentCreateComponent {
  paymentForm: FormGroup;
  errorMessage = '';
  private idempotencyKey = this.newIdempotencyKey();

  constructor(
    private fb: FormBuilder,
    public dataService: InsuranceDataService,
    private router: Router
  ) {
    this.paymentForm = this.fb.group({
      policyId: ['', [Validators.required]],
      amount: [500, [Validators.required, Validators.min(1)]],
      currency: ['USD', [Validators.required]],
      paymentMethodReference: ['', [Validators.required]]
    });
  }

  private newIdempotencyKey(): string {
    const cryptoObj = (globalThis as any).crypto;
    if (cryptoObj && typeof cryptoObj.randomUUID === 'function') {
      return cryptoObj.randomUUID();
    }
    return `pay-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  onSubmit() {
    if (this.paymentForm.valid) {
      this.errorMessage = '';
      const payload: PaymentCreateRequest = {
        ...this.paymentForm.value,
        idempotencyKey: this.idempotencyKey
      };
      this.dataService.addPayment(payload).subscribe({
        next: () => {
          this.idempotencyKey = this.newIdempotencyKey();
          this.router.navigate(['/payments']);
        },
        error: (err) => { this.errorMessage = err?.error?.message || 'Failed to record payment. Please try again.'; }
      });
    }
  }
}
