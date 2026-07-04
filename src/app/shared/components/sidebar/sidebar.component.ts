import { Component, Input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppRoute } from '../../../core/models/app-route.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
  @Input() routes: AppRoute[] = [];
  @Input() isOpen = false;

  readonly groupedRoutes = computed(() => {
    const main: AppRoute[] = [];
    const analytics: AppRoute[] = [];

    for (const route of this.routes) {
      if (route.path.startsWith('/analytics/')) {
        analytics.push(route);
      } else if (route.path !== '**') {
        main.push(route);
      }
    }

    return { main, analytics };
  });
}
