import { Component, EventEmitter, Output, inject } from '@angular/core';
import { ThemeService } from '../../../core/services/theme.service';
import { APP_NAME } from '../../../core/constants/app.constants';
import { DateRangeSelectorComponent } from '../../../features/dashboard/components/date-range-selector/date-range-selector.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [DateRangeSelectorComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  @Output() sidebarToggle = new EventEmitter<void>();

  readonly themeService = inject(ThemeService);
  readonly appName = APP_NAME;

  onToggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
