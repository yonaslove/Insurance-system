import { Component, OnInit, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InsuranceDataService } from '../../../core/services/insurance-data.service';
import { Claim } from '../../../core/models/claim.model';
import { CardComponent } from '../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-claim-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, CardComponent, ButtonComponent, BadgeComponent, EmptyStateComponent],
  templateUrl: './claim-list.component.html',
  styleUrl: './claim-list.component.css'
})
export class ClaimListComponent implements OnInit {
  public dataService = inject(InsuranceDataService);

  claims = computed(() => this.dataService.claims());

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.dataService.loadClaims().subscribe({ error: () => {} });
    this.dataService.loadPolicies().subscribe({ error: () => {} });
  }

  selectedClaim: Claim | null = null;
  adjudicationAmount = 0;
  adjudicationNotes = '';
  successToast = '';

  openAdjudication(claim: Claim) {
    this.selectedClaim = claim;
    this.adjudicationAmount = claim.claimedAmount;
    this.adjudicationNotes = 'Loss verified against policy terms and evidentiary documents. Approved for settlement disbursement.';
  }

  closeModal() {
    this.selectedClaim = null;
  }

  confirmApproval() {
    if (!this.selectedClaim) return;
    const claim = this.selectedClaim;

    this.dataService.decideClaim(claim.id, {
      status: 'APPROVED',
      approvedAmount: this.adjudicationAmount,
      reviewerNotes: this.adjudicationNotes
    });

    this.successToast = `Claim "${claim.claimNumber}" approved for $${this.adjudicationAmount.toFixed(2)} settlement!`;
    this.closeModal();
  }

  confirmRejection() {
    if (!this.selectedClaim) return;
    const claim = this.selectedClaim;

    this.dataService.decideClaim(claim.id, {
      status: 'REJECTED',
      reviewerNotes: this.adjudicationNotes || 'Incident falls outside covered perils under standard policy terms.'
    });

    this.successToast = `Claim "${claim.claimNumber}" has been officially rejected.`;
    this.closeModal();
  }
}
