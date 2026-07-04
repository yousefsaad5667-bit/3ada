import { ImportStrategy } from './import-strategy.model';

export interface ImportSummary {
  recordsImported: number;
  recordsSkipped: number;
  strategy: ImportStrategy;
}
