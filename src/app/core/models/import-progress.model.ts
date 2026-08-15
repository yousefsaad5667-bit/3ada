import { ImportSummary } from './import-summary.model';

export interface ImportProgress {
  status: 'idle' | 'parsing' | 'processing' | 'done' | 'error';
  totalRecords: number;
  processedRecords: number;
  percentComplete: number;
  errorMessageAr: string | null;
  summary?: ImportSummary;
}
