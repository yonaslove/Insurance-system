import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.css'
})
export class PaginationComponent implements OnChanges {
  @Input() currentPage: number = 1;
  @Input() totalItems: number = 0;
  @Input() pageSize: number = 10;
  @Input() pageSizeOptions: number[] = [5, 10, 20, 50];

  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  totalPages: number = 1;
  startItem: number = 0;
  endItem: number = 0;
  visiblePages: (number | string)[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    this.calculatePagination();
  }

  calculatePagination(): void {
    this.totalPages = Math.max(1, Math.ceil(this.totalItems / (this.pageSize || 10)));
    
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
      this.pageChange.emit(this.currentPage);
    }
    if (this.currentPage < 1) {
      this.currentPage = 1;
    }

    if (this.totalItems === 0) {
      this.startItem = 0;
      this.endItem = 0;
    } else {
      this.startItem = (this.currentPage - 1) * this.pageSize + 1;
      this.endItem = Math.min(this.currentPage * this.pageSize, this.totalItems);
    }

    this.visiblePages = this.buildPageNumbers();
  }

  buildPageNumbers(): (number | string)[] {
    const total = this.totalPages;
    const current = this.currentPage;
    const pages: (number | string)[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
      return pages;
    }

    // Always include page 1
    pages.push(1);

    if (current > 3) {
      pages.push('...');
    }

    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (current < total - 2) {
      pages.push('...');
    }

    // Always include last page
    pages.push(total);

    return pages;
  }

  goToPage(page: number | string): void {
    if (typeof page !== 'number') return;
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    this.currentPage = page;
    this.calculatePagination();
    this.pageChange.emit(this.currentPage);
  }

  previous(): void {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  next(): void {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }

  onSizeChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const newSize = parseInt(select.value, 10);
    if (newSize && newSize !== this.pageSize) {
      this.pageSize = newSize;
      this.currentPage = 1;
      this.calculatePagination();
      this.pageSizeChange.emit(newSize);
      this.pageChange.emit(1);
    }
  }
}
