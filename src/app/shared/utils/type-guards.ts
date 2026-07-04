import { AppTheme } from '../../core/models/app-theme.model';

export function isAppTheme(value: unknown): value is AppTheme {
  return typeof value === 'string' && (value === 'dark' || value === 'light');
}

export function isString(value: unknown): value is string {
  return typeof value === 'string';
}
