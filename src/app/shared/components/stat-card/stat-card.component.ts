import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stat-card.component.html',
  styleUrls: ['./stat-card.component.scss']
})
export class StatCardComponent {
  @Input() title: string = '';
  @Input() value: string = '';
  @Input() icon: string = '';
  @Input() color: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'accent' = 'primary';
  @Input() trend?: 'up' | 'down';
  @Input() trendValue?: string;
  @Input() description?: string;
}
