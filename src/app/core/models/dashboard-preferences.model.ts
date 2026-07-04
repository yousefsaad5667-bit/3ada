export interface DashboardPreferences {
  cardOrder: string[];
  hiddenCards: string[];
}

export const DEFAULT_DASHBOARD_PREFERENCES: DashboardPreferences = {
  cardOrder: [],
  hiddenCards: [],
};
