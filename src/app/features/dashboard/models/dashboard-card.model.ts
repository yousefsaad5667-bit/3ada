import { Type } from '@angular/core';

export type CardState = 'loading' | 'data' | 'empty' | 'error';

export interface DashboardCard {
  /** Stable, unique string key from descriptor. */
  id: string;

  /** Arabic display title from descriptor. */
  titleAr: string;

  /** Angular standalone component class from descriptor. */
  component: Type<unknown>;

  /** Resolved order (from preferences or defaultOrder). */
  order: number;

  /** Whether the card should be rendered or shown as a placeholder tile. */
  visible: boolean;
}
