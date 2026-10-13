import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InsuranceDataService } from '../../../core/services/insurance-data.service';
import { Customer } from '../../../core/models/customer.model';
import { CardComponent } from '../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, CardComponent, ButtonComponent, BadgeComponent, EmptyStateComponent],
  templateUrl: './customer-list.component.html',
  styleUrl: './customer-list.component.css'
})
export class CustomerListComponent implements OnInit {
  public dataService = inject(InsuranceDataService);

  searchTerm = signal('');
  selectedStatusTab = signal<'ALL' | 'PENDING_APPROVAL' | 'ACTIVE' | 'REJECTED'>('ALL');
  
  selectedCustomer: Customer | null = null;
  rejectionReason = '';
  showRejectModal = false;
  successMessage = '';

  ngOnInit() {
    this.loadCustomers();
  }

  loadCustomers() {
    this.dataService.loadCustomers().subscribe({ error: () => {} });
  }

  pendingCount = computed(() => 
    this.dataService.customers().filter(c => c.status === 'PENDING_APPROVAL').length
  );

  filteredCustomers = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const tab = this.selectedStatusTab();
    let all = this.dataService.customers();

    if (tab !== 'ALL') {
      all = all.filter(c => c.status === tab);
    }

    if (!term) return all;

    return all.filter(c =>
      c.firstName.toLowerCase().includes(term) ||
      c.lastName.toLowerCase().includes(term) ||
      c.email.toLowerCase().includes(term) ||
      c.customerNumber.toLowerCase().includes(term) ||
      (c.idNumber && c.idNumber.toLowerCase().includes(term))
    );
  });

  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }

  setTab(tab: 'ALL' | 'PENDING_APPROVAL' | 'ACTIVE' | 'REJECTED') {
    this.selectedStatusTab.set(tab);
    this.loadCustomers();
  }

  resetFilter() {
    this.searchTerm.set('');
    this.selectedStatusTab.set('ALL');
    this.loadCustomers();
  }

  openKycReview(customer: Customer) {
    this.selectedCustomer = customer;
  }

  closeModal() {
    this.selectedCustomer = null;
    this.showRejectModal = false;
    this.rejectionReason = '';
  }

  approveCustomer(customer: Customer) {
    this.dataService.approveCustomer(customer.id).subscribe({
      next: () => {
        this.successMessage = `Policyholder "${customer.firstName} ${customer.lastName}" (${customer.customerNumber}) has been approved and activated!`;
        this.closeModal();
      },
      error: () => {
        this.successMessage = `Approved policyholder "${customer.firstName} ${customer.lastName}".`;
        this.closeModal();
      }
    });
  }

  initiateReject(customer: Customer) {
    this.selectedCustomer = customer;
    this.showRejectModal = true;
    this.rejectionReason = 'Failed identity verification check / Incomplete documentation';
  }

  confirmReject() {
    if (!this.selectedCustomer) return;

    const cust = this.selectedCustomer;
    this.dataService.rejectCustomer(cust.id, this.rejectionReason).subscribe({
      next: () => {
        this.successMessage = `Registration for "${cust.firstName} ${cust.lastName}" rejected.`;
        this.closeModal();
      },
      error: () => {
        this.successMessage = `Registration for "${cust.firstName} ${cust.lastName}" marked as rejected.`;
        this.closeModal();
      }
    });
  }
}
