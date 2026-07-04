export interface RelapseRecord {
  id: string;
  date: string;
  time: string | null;
  ampm: 'am' | 'pm' | null;
  count: number;
  urgeLevel: number | null;
  reason: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}
