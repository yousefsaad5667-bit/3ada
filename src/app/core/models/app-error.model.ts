export type ErrorSeverity = 'info' | 'warning' | 'error' | 'fatal';

export interface AppError {
  id: string;
  message: string;
  severity: ErrorSeverity;
  timestamp: string;
  originalError?: unknown;
}
