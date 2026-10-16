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
  selector: 'app-policy-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, CardComponent, ButtonComponent, BadgeComponent, EmptyStateComponent, PaginationComponent],
  templateUrl: './policy-list.component.html',
  styleUrl: './policy-list.component.css'
})
export class PolicyListComponent implements OnInit {
  searchTerm = signal('');
  currentPage = signal(1);
  pageSize = signal(10);

  constructor(public dataService: InsuranceDataService) {}

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.dataService.loadPolicies().subscribe({ error: () => {} });
    this.dataService.loadCustomers().subscribe({ error: () => {} });
    this.dataService.loadProducts().subscribe({ error: () => {} });
  }

  filteredPolicies = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const all = this.dataService.policies();
    if (!term) return all;
    return all.filter(p =>
      (p.policyNumber && p.policyNumber.toLowerCase().includes(term)) ||
      (p.customerName && p.customerName.toLowerCase().includes(term)) ||
      (p.productName && p.productName.toLowerCase().includes(term)) ||
      (p.status && p.status.toLowerCase().includes(term))
    );
  });

  paginatedPolicies = computed(() => {
    const items = this.filteredPolicies();
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
