import { RelapseRecord } from '../models/relapse-record.model';
import { ValidationResult, ValidationError } from '../models/validation-result.model';

export function validateRelapseRecord(
  draft: Omit<RelapseRecord, 'id' | 'createdAt' | 'updatedAt'>
): ValidationResult<Omit<RelapseRecord, 'id' | 'createdAt' | 'updatedAt'>> {
  const errors: ValidationError[] = [];

  // 1. Validate date
  if (!draft.date || draft.date.trim() === '') {
    errors.push({ field: 'date', messageAr: 'حقل التاريخ مطلوب.' });
  } else {
    // Basic date validation YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(draft.date)) {
      errors.push({ field: 'date', messageAr: 'التاريخ غير صالح.' });
    } else {
      const d = new Date(draft.date);
      if (isNaN(d.getTime())) {
        errors.push({ field: 'date', messageAr: 'التاريخ غير صالح.' });
      } else {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const recordDate = new Date(draft.date);
        recordDate.setHours(0, 0, 0, 0);
        if (recordDate > today) {
          errors.push({ field: 'date', messageAr: 'لا يمكن تسجيل سجل في المستقبل.' });
        }
      }
    }
  }

  // 2. Validate count
  if (!('count' in draft) || (draft as Record<string, unknown>)['count'] === null) {
    errors.push({ field: 'count', messageAr: 'حقل العدد مطلوب.' });
  } else if (!Number.isInteger(draft.count) || draft.count <= 0) {
    errors.push({ field: 'count', messageAr: 'العدد يجب أن يكون رقماً صحيحاً موجباً.' });
  }

  // 3. Validate urgeLevel
  if ('urgeLevel' in draft && draft.urgeLevel !== null) {
    if (!Number.isInteger(draft.urgeLevel)) {
      errors.push({ field: 'urgeLevel', messageAr: 'مستوى الرغبة يجب أن يكون رقماً صحيحاً.' });
    } else if (draft.urgeLevel < 1 || draft.urgeLevel > 10) {
      errors.push({ field: 'urgeLevel', messageAr: 'مستوى الرغبة يجب أن يكون بين 1 و10.' });
    }
  }

  // 4. Validate time
  if ('time' in draft && draft.time) {
    const timeRegex = /^([0-1]?\d|2[0-3]):[0-5]\d$/;
    if (!timeRegex.test(draft.time)) {
      errors.push({ field: 'time', messageAr: 'صيغة الوقت غير صالحة.' });
    }
  }

  // 5. Validate reason length
  if (draft.reason && draft.reason.length > 500) {
    errors.push({ field: 'reason', messageAr: 'السبب يجب ألا يتجاوز 500 حرف.' });
  }

  // 6. Validate notes length
  if (draft.notes && draft.notes.length > 1000) {
    errors.push({ field: 'notes', messageAr: 'الملاحظات يجب ألا تتجاوز 1000 حرف.' });
  }

  if (errors.length > 0) {
    return { valid: false, value: null, errors };
  }

  return { valid: true, value: draft, errors: [] };
}
