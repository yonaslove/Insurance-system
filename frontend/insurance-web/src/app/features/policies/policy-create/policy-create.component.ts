import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { InsuranceDataService } from '../../../core/services/insurance-data.service';
import { CardComponent } from '../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';

@Component({
  selector: 'app-policy-create',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, CardComponent, ButtonComponent],
  templateUrl: './policy-create.component.html',
  styleUrl: './policy-create.component.css'
})
export class PolicyCreateComponent {
  policyForm: FormGroup;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    public dataService: InsuranceDataService,
    private router: Router
  ) {
    this.policyForm = this.fb.group({
      customerId: ['', [Validators.required]],
      productId: ['', [Validators.required]],
      startDate: ['2026-05-01', [Validators.required]],
      endDate: ['2027-05-01', [Validators.required]],
      premiumAmount: [1200, [Validators.required, Validators.min(1)]],
      currency: ['USD', [Validators.required]]
    });
  }

  onSubmit() {
    if (this.policyForm.valid) {
      this.errorMessage = '';
      this.dataService.addPolicy(this.policyForm.value).subscribe({
        next: () => this.router.navigate(['/policies']),
        error: (err) => { this.errorMessage = err?.error?.message || 'Failed to bind policy. Please try again.'; }
      });
    }
  }
}
