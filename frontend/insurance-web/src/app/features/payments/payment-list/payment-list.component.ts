import { Component, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { InsuranceDataService } from '../../../core/services/insurance-data.service';
import { CardComponent } from '../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-payment-list',
  standalone: true,
  imports: [CommonModule, RouterModule, CardComponent, ButtonComponent, BadgeComponent, EmptyStateComponent],
  templateUrl: './payment-list.component.html',
  styleUrl: './payment-list.component.css'
})
export class PaymentListComponent implements OnInit {
  payments = computed(() => this.dataService.payments());

  constructor(public dataService: InsuranceDataService) {}

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.dataService.loadPayments().subscribe({ error: () => {} });
    this.dataService.loadPolicies().subscribe({ error: () => {} });
  }
}
