import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InsuranceDataService } from '../../../core/services/insurance-data.service';
import { Claim } from '../../../core/models/claim.model';
import { CardComponent } from '../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-claim-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, CardComponent, ButtonComponent, BadgeComponent, EmptyStateComponent, PaginationComponent],
  templateUrl: './claim-list.component.html',
  styleUrl: './claim-list.component.css'
})
export class ClaimListComponent implements OnInit {
  public dataService = inject(InsuranceDataService);

  searchTerm = signal('');
  selectedStatusFilter = signal<string>('ALL');
  currentPage = signal(1);
  pageSize = signal(10);

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.dataService.loadClaims().subscribe({ error: () => {} });
    this.dataService.loadPolicies().subscribe({ error: () => {} });
  }

  filteredClaims = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const status = this.selectedStatusFilter();
    let all = this.dataService.claims();

    if (status !== 'ALL') {
      all = all.filter(c => c.status === status);
    }

    if (!term) return all;

    return all.filter(c =>
      (c.claimNumber && c.claimNumber.toLowerCase().includes(term)) ||
      (c.policyNumber && c.policyNumber.toLowerCase().includes(term)) ||
      (c.description && c.description.toLowerCase().includes(term)) ||
      (c.status && c.status.toLowerCase().includes(term))
    );
  });

  paginatedClaims = computed(() => {
    const items = this.filteredClaims();
    const page = this.currentPage();
    const size = this.pageSize();
    const start = (page - 1) * size;
    return items.slice(start, start + size);
  });

  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
    this.currentPage.set(1);
  }

  setStatusFilter(status: string) {
    this.selectedStatusFilter.set(status);
    this.currentPage.set(1);
  }

  resetFilter() {
    this.searchTerm.set('');
    this.selectedStatusFilter.set('ALL');
    this.currentPage.set(1);
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
  }

  onPageSizeChange(size: number) {
    this.pageSize.set(size);
    this.currentPage.set(1);
  }

  selectedClaim: Claim | null = null;
  adjudicationAmount = 0;
  adjudicationNotes = '';
  successToast = '';
  errorToast = '';

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
    this.errorToast = '';

    this.dataService.decideClaim(claim.id, {
      status: 'APPROVED',
      approvedAmount: this.adjudicationAmount,
      reviewerNotes: this.adjudicationNotes
    }).subscribe({
      next: () => {
        this.successToast = `Claim "${claim.claimNumber}" approved for $${this.adjudicationAmount.toFixed(2)} settlement!`;
        this.closeModal();
      },
      error: (err) => { this.errorToast = err?.error?.message || 'Failed to approve claim.'; }
    });
  }

  confirmRejection() {
    if (!this.selectedClaim) return;
    const claim = this.selectedClaim;
    this.errorToast = '';

    this.dataService.decideClaim(claim.id, {
      status: 'REJECTED',
      reviewerNotes: this.adjudicationNotes || 'Incident falls outside covered perils under standard policy terms.'
    }).subscribe({
      next: () => {
        this.successToast = `Claim "${claim.claimNumber}" has been officially rejected.`;
        this.closeModal();
      },
      error: (err) => { this.errorToast = err?.error?.message || 'Failed to reject claim.'; }
    });
  }
}
