import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { InsuranceDataService } from '../../../core/services/insurance-data.service';
import { CardComponent } from '../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';

@Component({
  selector: 'app-product-create',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, CardComponent, ButtonComponent],
  templateUrl: './product-create.component.html',
  styleUrl: './product-create.component.css'
})
export class ProductCreateComponent {
  productForm: FormGroup;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private dataService: InsuranceDataService,
    private router: Router
  ) {
    this.productForm = this.fb.group({
      code: ['', [Validators.required]],
      category: ['HEALTH', [Validators.required]],
      name: ['', [Validators.required]],
      description: ['', [Validators.required]],
      basePremium: [100, [Validators.required, Validators.min(1)]],
      active: [true]
    });
  }

  onSubmit() {
    if (this.productForm.valid) {
      this.errorMessage = '';
      this.dataService.addProduct(this.productForm.value).subscribe({
        next: () => this.router.navigate(['/products']),
        error: (err) => { this.errorMessage = err?.error?.message || 'Failed to create product. Please try again.'; }
      });
    }
  }
}
