import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { InsuranceDataService } from '../../../core/services/insurance-data.service';
import { CardComponent } from '../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';

@Component({
  selector: 'app-customer-create',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, CardComponent, ButtonComponent],
  templateUrl: './customer-create.component.html',
  styleUrl: './customer-create.component.css'
})
export class CustomerCreateComponent {
  customerForm: FormGroup;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private dataService: InsuranceDataService,
    private router: Router
  ) {
    this.customerForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      address: ['', [Validators.required]]
    });
  }

  onSubmit() {
    if (this.customerForm.valid) {
      this.errorMessage = '';
      this.dataService.addCustomer(this.customerForm.value).subscribe({
        next: () => this.router.navigate(['/customers']),
        error: (err) => { this.errorMessage = err?.error?.message || 'Failed to register customer. Please try again.'; }
      });
    }
  }
}
