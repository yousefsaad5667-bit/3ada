import { Settings, DEFAULT_SETTINGS } from '../models/settings.model';
import { ValidationResult, ValidationError } from '../models/validation-result.model';

export function validateSettings(draft: Partial<Settings>): ValidationResult<Settings> {
  const errors: ValidationError[] = [];

  const theme = draft.theme as unknown;
  if (theme !== undefined && theme !== 'dark' && theme !== 'light') {
    errors.push({ field: 'theme', messageAr: 'قيمة السمة غير صالحة.' });
  }

  const language = draft.language as unknown;
  if (language !== undefined && language !== 'ar') {
    errors.push({ field: 'language', messageAr: 'قيمة اللغة غير صالحة.' });
  }

  if (draft.defaultUrgeLevel !== undefined && draft.defaultUrgeLevel !== null) {
    if (
      !Number.isInteger(draft.defaultUrgeLevel) ||
      draft.defaultUrgeLevel < 1 ||
      draft.defaultUrgeLevel > 10
    ) {
      errors.push({
        field: 'defaultUrgeLevel',
        messageAr: 'مستوى الرغبة الافتراضي يجب أن يكون بين 1 و10.',
      });
    }
  }

  if (errors.length > 0) {
    return { valid: false, value: null, errors };
  }

  const value: Settings = {
    ...DEFAULT_SETTINGS,
    ...draft,
  };

  return { valid: true, value, errors: [] };
}
