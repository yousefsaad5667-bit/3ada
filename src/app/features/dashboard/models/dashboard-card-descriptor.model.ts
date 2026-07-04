import { Type } from '@angular/core';

export interface DashboardCardDescriptor {
  /** Stable, unique string key. Never changes across versions. */
  id: string;

  /** Arabic display title shown in card header and in the hidden placeholder tile. */
  titleAr: string;

  /** Angular standalone component class rendered via NgComponentOutlet. */
  component: Type<unknown>;

  /** Zero-indexed default position in the card grid. Used when user has no saved preference. */
  defaultOrder: number;
}
