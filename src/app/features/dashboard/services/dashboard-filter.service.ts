import { Injectable, signal } from '@angular/core';
import { DatePreset, getDateRangeBounds } from '../../../core/analytics';

export interface DateRangeFilter {
  preset: DatePreset;
  startDate: Date;
  endDate: Date;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardFilterService {
  private readonly defaultPreset: DatePreset = 'last7';
  
  private _activeFilter = signal<DateRangeFilter>(this.createFilter(this.defaultPreset));
  readonly activeFilter = this._activeFilter.asReadonly();

  setFilter(filter: DateRangeFilter) {
    if (filter.startDate > filter.endDate) {
      throw new Error('startDate must be before or equal to endDate');
    }
    this._activeFilter.set(filter);
  }

  setPreset(preset: DatePreset) {
    this._activeFilter.set(this.createFilter(preset));
  }

  private createFilter(preset: DatePreset): DateRangeFilter {
    const bounds = getDateRangeBounds(preset);
    
    let start: Date;
    let end: Date;

    if (bounds) {
      start = new Date(`${bounds.from}T00:00:00`);
      end = new Date(`${bounds.to}T23:59:59`);
    } else {
      start = new Date(0);
      end = new Date();
    }

    return {
      preset,
      startDate: start,
      endDate: end
    };
  }
}
