import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InsuranceDataService } from '../../../core/services/insurance-data.service';
import { CardComponent } from '../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-payment-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, CardComponent, ButtonComponent, BadgeComponent, EmptyStateComponent, PaginationComponent],
  templateUrl: './payment-list.component.html',
  styleUrl: './payment-list.component.css'
})
export class PaymentListComponent implements OnInit {
  searchTerm = signal('');
  currentPage = signal(1);
  pageSize = signal(10);

  constructor(public dataService: InsuranceDataService) {}

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.dataService.loadPayments().subscribe({ error: () => {} });
    this.dataService.loadPolicies().subscribe({ error: () => {} });
  }

  filteredPayments = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const all = this.dataService.payments();
    if (!term) return all;
    return all.filter(p =>
      (p.paymentReference && p.paymentReference.toLowerCase().includes(term)) ||
      (p.policyId && p.policyId.toLowerCase().includes(term)) ||
      (p.paymentMethodReference && p.paymentMethodReference.toLowerCase().includes(term)) ||
      (p.status && p.status.toLowerCase().includes(term))
    );
  });

  paginatedPayments = computed(() => {
    const items = this.filteredPayments();
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

  resetFilter() {
    this.searchTerm.set('');
    this.currentPage.set(1);
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
  }

  onPageSizeChange(size: number) {
    this.pageSize.set(size);
    this.currentPage.set(1);
  }
}
