import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.css'
})
export class AlertComponent {
  @Input() type: 'info' | 'success' | 'warning' | 'danger' = 'info';
  @Input() title?: string;
  @Input() dismissible: boolean = false;

  @Output() closed = new EventEmitter<void>();

  dismiss() {
    this.closed.emit();
  }
}
