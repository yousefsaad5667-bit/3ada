import { ExportBundle } from '../models/export-bundle.model';
import { ValidationResult, ValidationError } from '../models/validation-result.model';
import { CURRENT_SCHEMA_VERSION } from '../constants/storage-version.constants';

export function validateExportBundle(parsed: unknown): ValidationResult<ExportBundle> {
  const errors: ValidationError[] = [];

  if (typeof parsed !== 'object' || parsed === null) {
    errors.push({ field: 'file', messageAr: 'ملف الاستيراد غير صالح أو تالف.' });
    return { valid: false, value: null, errors };
  }

  const bundle = parsed as Record<string, unknown>;

  if (typeof bundle['schemaVersion'] !== 'number') {
    errors.push({ field: 'schemaVersion', messageAr: 'إصدار المخطط مفقود في الملف.' });
  } else if (bundle['schemaVersion'] > CURRENT_SCHEMA_VERSION) {
    errors.push({
      field: 'schemaVersion',
      messageAr: 'إصدار المخطط غير مدعوم. يرجى تحديث التطبيق.',
    });
  }

  if (!Array.isArray(bundle['relapseRecords'])) {
    errors.push({ field: 'relapseRecords', messageAr: 'بيانات السجلات غير صالحة في الملف.' });
  }

  if (typeof bundle['settings'] !== 'object' || bundle['settings'] === null) {
    errors.push({ field: 'settings', messageAr: 'بيانات الإعدادات غير صالحة في الملف.' });
  }

  if (
    typeof bundle['dashboardPreferences'] !== 'object' ||
    bundle['dashboardPreferences'] === null
  ) {
    errors.push({
      field: 'dashboardPreferences',
      messageAr: 'بيانات التفضيلات غير صالحة في الملف.',
    });
  }

  if (errors.length > 0) {
    return { valid: false, value: null, errors };
  }

  return { valid: true, value: parsed as ExportBundle, errors: [] };
}
