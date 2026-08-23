export const RECORD_ERRORS = {
  DATE_INVALID: 'تنسيق التاريخ غير صحيح. يجب أن يكون YYYY-MM-DD',
  COUNT_INVALID: 'يجب أن يكون العدد عددًا صحيحًا أكبر من أو يساوي 1',
  URGE_LEVEL_INVALID: 'يجب أن تكون مستوى الرغبة عددًا صحيحًا بين 1 و 10',
  RECORD_NOT_FOUND: 'السجل غير موجود',
  FORBIDDEN: 'ليس لديك صلاحية للوصول إلى هذا السجل',
  MISSING_REQUIRED_FIELDS: 'يرجى تعبئة جميع الحقول المطلوبة',
  INTERNAL_ERROR: 'خطأ داخلي في الخادم',
} as const;