import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { InsuranceDataService } from '../../../core/services/insurance-data.service';
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

  onSubmit() {
    if (this.paymentForm.valid) {
      this.dataService.addPayment(this.paymentForm.value);
      this.router.navigate(['/payments']);
    }
  }
}
