import { Component, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { InsuranceDataService } from '../../core/services/insurance-data.service';
import { CardComponent } from '../../shared/components/card/card.component';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { ButtonComponent } from '../../shared/components/button/button.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, CardComponent, StatCardComponent, ButtonComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  summary = computed(() => this.dataService.dashboardSummary());

  constructor(private dataService: InsuranceDataService) {}

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.dataService.loadAll();
  }
}
