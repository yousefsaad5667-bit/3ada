import { DatePreset } from '../../../core/analytics/models/analytics.types';
export type { DatePreset };
export { getDateRangeBounds } from '../../../core/analytics/utils/date-range.utils';

export type SortField = 'date' | 'count';
export type SortDir = 'asc' | 'desc';

export interface RecordFilter {
  searchQuery: string;
  datePreset: DatePreset;
  customFrom: string | null;
  customTo: string | null;
  sortField: SortField;
  sortDir: SortDir;
}
