import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardFilterService } from '../../services/dashboard-filter.service';
import { DatePreset } from '../../../../core/analytics';

@Component({
  selector: 'app-date-range-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './date-range-selector.component.html',
  styleUrl: './date-range-selector.component.scss'
})
export class DateRangeSelectorComponent {
  private filterService = inject(DashboardFilterService);
  
  activeFilter = this.filterService.activeFilter;
  
  presets: { id: DatePreset; label: string }[] = [
    { id: 'today', label: 'اليوم' },
    { id: 'last7', label: 'آخر 7 أيام' },
    { id: 'last30', label: 'آخر 30 يوم' },
    { id: 'last90', label: 'آخر 90 يوم' },
    { id: 'lastYear', label: 'العام الماضي' },
    { id: 'all', label: 'كل الوقت' }
  ];

  selectPreset(preset: DatePreset) {
    this.filterService.setPreset(preset);
  }
}
