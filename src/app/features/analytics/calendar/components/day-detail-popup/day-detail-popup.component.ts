import { Component, computed, inject, ChangeDetectionStrategy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarAnalyticsService } from '../../services/calendar-analytics.service';

@Component({
  selector: 'app-day-detail-popup',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './day-detail-popup.component.html',
  styleUrl: './day-detail-popup.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DayDetailPopupComponent {
  private service = inject(CalendarAnalyticsService);

  public readonly detail = computed(() => this.service.state().selectedDay);
  public readonly isOpen = computed(() => this.service.state().selectedDate !== null);

  onClose(): void {
    this.service.setSelectedDate(null);
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('popup-backdrop')) {
      this.onClose();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen()) {
      this.onClose();
    }
  }

  formatTime(timeStr: string | null, ampmStr: string | null): string {
    if (!timeStr) return '';
    return `${timeStr} ${ampmStr || ''}`.trim();
  }
}
