import { Injectable, computed, inject, signal } from '@angular/core';
import { RelapseRecordRepository } from '../../../../core/services/relapse-record.repository';
import { DashboardFilterService, DateRangeFilter } from '../../../dashboard/services/dashboard-filter.service';
import { getHeatmap, getDateRangeBounds } from '../../../../core/analytics';
import { isValidDate, formatISO } from '../../../../core/analytics/utils/date-range.utils';
import { RelapseRecord } from '../../../../core/models/relapse-record.model';
import {
  CalendarAnalyticsState,
  HeatmapGrid,
  CalendarMonthGrid,
  DayDetail,
  CalendarDay,
  IntensityLevel,
  HeatmapWeek,
  MonthLabel
} from '../models/calendar-view.model';

@Injectable({
  providedIn: 'root'
})
export class CalendarAnalyticsService {
  private repository = inject(RelapseRecordRepository);
  private filterService = inject(DashboardFilterService);

  public readonly selectedDate = signal<string | null>(null);
  
  private initialMonth = new Date();
  public readonly currentMonth = signal<{ year: number; month: number }>({
    year: this.initialMonth.getFullYear(),
    month: this.initialMonth.getMonth() + 1
  });

  public readonly state = computed<CalendarAnalyticsState>(() => {
    const filter = this.filterService.activeFilter();
    const records = this.repository.records();
    const bounds = this.getFilterBounds(filter);

    const validRecords = records.filter(r => r.date && r.count >= 0 && isValidDate(r.date));
    const invalidRecordCount = records.length - validRecords.length;

    if (validRecords.length === 0) {
      return this.createEmptyState(bounds, invalidRecordCount);
    }

    const range = { from: bounds.start, to: bounds.end };

    // Get basic heatmap intensities from engine
    const heatmapEntries = getHeatmap(validRecords, range);
    const maxDayCount = Math.max(...heatmapEntries.map(e => e.count), 0);
    const entryMap = new Map(heatmapEntries.map(e => [e.date, e]));

    // Generate grids
    const heatmapGrid = this.buildHeatmapGrid(validRecords, entryMap, bounds, maxDayCount);
    const currentMonthGrid = this.buildMonthGrid(validRecords, entryMap, bounds);

    // Compute selected day detail
    const selected = this.selectedDate();
    let selectedDay: DayDetail | null = null;
    if (selected) {
      selectedDay = this.buildDayDetail(validRecords, selected);
    }

    return {
      status: 'data',
      heatmapGrid,
      currentMonthGrid,
      selectedDay,
      selectedDate: selected,
      currentMonth: this.currentMonth(),
      rangeStart: bounds.start,
      rangeEnd: bounds.end,
      invalidRecordCount,
      errorMessageAr: null
    };
  });

  private createEmptyState(bounds: { start: string, end: string }, invalidRecordCount: number): CalendarAnalyticsState {
    const emptyHeatmap: HeatmapGrid = {
      weeks: [],
      rangeStart: bounds.start,
      rangeEnd: bounds.end,
      activeRangeStart: bounds.start,
      activeRangeEnd: bounds.end,
      maxDayCount: 0,
      monthLabels: []
    };

    const emptyMonthGrid: CalendarMonthGrid = {
      year: this.currentMonth().year,
      month: this.currentMonth().month,
      labelAr: this.getArabicMonthLabel(this.currentMonth().year, this.currentMonth().month),
      days: [],
      leadingBlanks: 0,
      trailingBlanks: 0,
      hasActivity: false
    };

    return {
      status: 'empty',
      heatmapGrid: emptyHeatmap,
      currentMonthGrid: emptyMonthGrid,
      selectedDay: null,
      selectedDate: null,
      currentMonth: this.currentMonth(),
      rangeStart: bounds.start,
      rangeEnd: bounds.end,
      invalidRecordCount,
      errorMessageAr: null
    };
  }

  private buildHeatmapGrid(
    records: RelapseRecord[],
    entryMap: Map<string, any>,
    bounds: { start: string, end: string },
    maxDayCount: number
  ): HeatmapGrid {
    // Determine the calendar grid start (first Sunday on or before bounds.start)
    const startDate = new Date(`${bounds.start}T00:00:00`);
    const dayOfWeek = startDate.getDay(); // 0 = Sunday
    startDate.setDate(startDate.getDate() - dayOfWeek);

    // Determine grid end (first Saturday on or after bounds.end)
    const endDate = new Date(`${bounds.end}T00:00:00`);
    const endDayOfWeek = endDate.getDay();
    if (endDayOfWeek !== 6) { // 6 = Saturday
      endDate.setDate(endDate.getDate() + (6 - endDayOfWeek));
    }

    const weeks: HeatmapWeek[] = [];
    const monthLabels: MonthLabel[] = [];
    const currentDate = new Date(startDate);
    let weekIndex = 0;
    let lastMonthSeen = -1;

    while (currentDate <= endDate) {
      const days: CalendarDay[] = [];
      for (let i = 0; i < 7; i++) {
        const isoDate = formatISO(currentDate);
        const dayMonth = currentDate.getMonth() + 1;

        if (i === 0 && dayMonth !== lastMonthSeen && isoDate >= bounds.start) {
          monthLabels.push({
            monthIndex: dayMonth,
            weekIndex,
            labelAr: this.getArabicMonthAbbr(dayMonth)
          });
          lastMonthSeen = dayMonth;
        }

        days.push(this.buildCalendarDay(records, entryMap, isoDate, bounds));
        currentDate.setDate(currentDate.getDate() + 1);
      }
      weeks.push({ weekIndex, days });
      weekIndex++;
    }

    return {
      weeks,
      rangeStart: formatISO(startDate),
      rangeEnd: formatISO(endDate),
      activeRangeStart: bounds.start,
      activeRangeEnd: bounds.end,
      maxDayCount,
      monthLabels
    };
  }

  private buildMonthGrid(
    records: RelapseRecord[],
    entryMap: Map<string, any>,
    bounds: { start: string, end: string }
  ): CalendarMonthGrid {
    const { year, month } = this.currentMonth();
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);

    const leadingBlanks = firstDay.getDay(); // 0 for Sunday
    const trailingBlanks = 6 - lastDay.getDay();

    const days: CalendarDay[] = [];
    let hasActivity = false;

    const current = new Date(firstDay);
    while (current <= lastDay) {
      const isoDate = formatISO(current);
      const day = this.buildCalendarDay(records, entryMap, isoDate, bounds);
      if (day.count > 0) hasActivity = true;
      days.push(day);
      current.setDate(current.getDate() + 1);
    }

    return {
      year,
      month,
      labelAr: this.getArabicMonthLabel(year, month),
      days,
      leadingBlanks,
      trailingBlanks,
      hasActivity
    };
  }

  private buildCalendarDay(
    records: RelapseRecord[],
    entryMap: Map<string, any>,
    isoDate: string,
    bounds: { start: string, end: string }
  ): CalendarDay {
    const entry = entryMap.get(isoDate);
    const count = entry ? entry.count : 0;
    const intensityValue = entry ? entry.intensity : 0;
    const intensity = this.getIntensityClass(intensityValue);
    
    const dayRecords = records.filter(r => r.date === isoDate);
    const recordsWithUrge = dayRecords.filter(r => r.urgeLevel !== null);
    const averageUrge = recordsWithUrge.length > 0 
      ? recordsWithUrge.reduce((sum, r) => sum + (r.urgeLevel || 0), 0) / recordsWithUrge.length
      : null;

    const reasons = Array.from(new Set(dayRecords.map(r => r.reason).filter(r => !!r))) as string[];
    const notes = dayRecords.map(r => r.notes).filter(n => !!n) as string[];

    const todayStr = formatISO(new Date());

    return {
      date: isoDate,
      count,
      averageUrge,
      reasons,
      notes,
      intensity,
      intensityValue,
      isInActiveRange: isoDate >= bounds.start && isoDate <= bounds.end,
      isToday: isoDate === todayStr
    };
  }

  private buildDayDetail(records: RelapseRecord[], isoDate: string): DayDetail {
    const dayRecords = records.filter(r => r.date === isoDate).sort((a, b) => {
      const timeA = a.time || '';
      const timeB = b.time || '';
      return timeA.localeCompare(timeB);
    });
    const totalCount = dayRecords.reduce((sum, r) => sum + r.count, 0);
    
    const recordsWithUrge = dayRecords.filter(r => r.urgeLevel !== null);
    const averageUrge = recordsWithUrge.length > 0 
      ? recordsWithUrge.reduce((sum, r) => sum + (r.urgeLevel || 0), 0) / recordsWithUrge.length
      : null;

    const uniqueReasons = Array.from(new Set(dayRecords.map(r => r.reason).filter(r => !!r))) as string[];
    const notes = dayRecords.map(r => r.notes).filter(n => !!n) as string[];

    return {
      date: isoDate,
      labelAr: this.formatArabicDateFull(isoDate),
      totalCount,
      averageUrge,
      uniqueReasons,
      notes,
      records: dayRecords,
      isEmpty: totalCount === 0
    };
  }

  private getIntensityClass(value: number): IntensityLevel {
    if (value === 0) return 'none';
    if (value <= 0.25) return 'low';
    if (value <= 0.50) return 'medium';
    if (value <= 0.75) return 'high';
    return 'very-high';
  }

  public setSelectedDate(date: string | null): void {
    this.selectedDate.set(date);
  }

  public navigateMonth(offset: number): void {
    const current = this.currentMonth();
    const targetDate = new Date(current.year, current.month - 1 + offset, 1);
    this.currentMonth.set({
      year: targetDate.getFullYear(),
      month: targetDate.getMonth() + 1
    });
  }

  protected getFilterBounds(filter: DateRangeFilter): { start: string, end: string } {
    return {
      start: formatISO(filter.startDate),
      end: formatISO(filter.endDate)
    };
  }

  private getArabicMonthAbbr(month: number): string {
    const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    return months[month - 1];
  }

  private getArabicMonthLabel(year: number, month: number): string {
    return `${this.getArabicMonthAbbr(month)} ${year}`;
  }

  private formatArabicDateFull(isoDate: string): string {
    const d = new Date(`${isoDate}T00:00:00`);
    const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    return `${days[d.getDay()]}، ${d.getDate()} ${this.getArabicMonthAbbr(d.getMonth() + 1)} ${d.getFullYear()}`;
  }
}
