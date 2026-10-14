import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { InsuranceDataService } from '../../../core/services/insurance-data.service';
import { CardComponent } from '../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';

@Component({
  selector: 'app-claim-create',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, CardComponent, ButtonComponent],
  templateUrl: './claim-create.component.html',
  styleUrl: './claim-create.component.css'
})
export class ClaimCreateComponent {
  claimForm: FormGroup;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    public dataService: InsuranceDataService,
    private router: Router
  ) {
    this.claimForm = this.fb.group({
      policyId: ['', [Validators.required]],
      incidentDate: ['2026-04-01', [Validators.required]],
      claimedAmount: [1500, [Validators.required, Validators.min(1)]],
      description: ['', [Validators.required]]
    });
  }

  onSubmit() {
    if (this.claimForm.valid) {
      this.errorMessage = '';
      this.dataService.addClaim(this.claimForm.value).subscribe({
        next: () => this.router.navigate(['/claims']),
        error: (err) => { this.errorMessage = err?.error?.message || 'Failed to submit claim. Please try again.'; }
      });
    }
  }
}
