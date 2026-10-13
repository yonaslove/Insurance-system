import { Component, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { InsuranceDataService } from '../../../core/services/insurance-data.service';
import { CardComponent } from '../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule, CardComponent, ButtonComponent, BadgeComponent],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css'
})
export class ProductListComponent implements OnInit {
  products = computed(() => this.dataService.products());

  constructor(public dataService: InsuranceDataService) {}

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.dataService.loadProducts().subscribe({ error: () => {} });
  }
}
