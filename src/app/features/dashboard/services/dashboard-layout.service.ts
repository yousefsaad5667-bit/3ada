import { Injectable, computed, inject, signal } from '@angular/core';
import { DashboardPreferencesRepository } from '../../../core/services/dashboard-preferences.repository';
import { DashboardCardDescriptor } from '../models/dashboard-card-descriptor.model';
import { DashboardCard } from '../models/dashboard-card.model';

@Injectable({ providedIn: 'root' })
export class DashboardLayoutService {
  private prefsRepo = inject(DashboardPreferencesRepository);
  
  private _registry = signal<DashboardCardDescriptor[]>([]);

  readonly cards = computed<DashboardCard[]>(() => {
    const prefs = this.prefsRepo.preferences();
    const registry = this._registry();
    
    const mappedCards = registry.map(desc => {
      const isHidden = prefs.hiddenCards.includes(desc.id);
      const prefOrderIndex = prefs.cardOrder.indexOf(desc.id);
      
      // If it exists in cardOrder, use its index. Otherwise fall back to a high number + defaultOrder
      const order = prefOrderIndex >= 0 ? prefOrderIndex : 1000 + desc.defaultOrder;
      
      return {
        id: desc.id,
        titleAr: desc.titleAr,
        component: desc.component,
        order,
        visible: !isHidden
      } as DashboardCard;
    });

    return mappedCards.sort((a, b) => a.order - b.order);
  });

  registerCards(descriptors: DashboardCardDescriptor[]) {
    this._registry.set(descriptors);
  }

  reorderCards(newOrder: string[]) {
    this.prefsRepo.update({ cardOrder: newOrder });
  }

  hideCard(id: string) {
    const hidden = this.prefsRepo.preferences().hiddenCards;
    if (!hidden.includes(id)) {
      this.prefsRepo.update({ hiddenCards: [...hidden, id] });
    }
  }

  showCard(id: string) {
    const hidden = this.prefsRepo.preferences().hiddenCards;
    this.prefsRepo.update({ hiddenCards: hidden.filter(h => h !== id) });
  }

  resetLayout() {
    this.prefsRepo.update({ cardOrder: [], hiddenCards: [] });
  }
}
