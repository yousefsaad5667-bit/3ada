import { RelapseRecord } from './relapse-record.model';
import { Settings } from './settings.model';
import { DashboardPreferences } from './dashboard-preferences.model';

export interface ExportBundle {
  schemaVersion: number;
  exportedAt: string;
  relapseRecords: RelapseRecord[];
  settings: Settings;
  dashboardPreferences: DashboardPreferences;
}
