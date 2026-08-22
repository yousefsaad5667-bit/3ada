export const ERRORS = {
  USERNAME_TOO_SHORT: 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل',
  USERNAME_TOO_LONG: 'اسم المستخدم يجب ألا يتجاوز 30 حرفاً',
  USERNAME_HAS_SPACES: 'اسم المستخدم لا يمكن أن يحتوي على مسافات',
  PASSWORD_TOO_SHORT: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل',
  USERNAME_TAKEN: 'اسم المستخدم مستخدم بالفعل',
  INVALID_CREDENTIALS: 'اسم المستخدم أو كلمة المرور غير صحيحة',
  INVALID_TOKEN: 'الرمز المميز غير صالح أو منتهي الصلاحية',
  UNAUTHORIZED: 'يجب تسجيل الدخول أولاً',
  MISSING_FIELDS: 'يرجى تعبئة جميع الحقول المطلوبة',
} as const;

export function validateCredentials(username?: string, password?: string): string | null {
  if (!username || !password) {
    return ERRORS.MISSING_FIELDS;
  }
  if (username.length < 3) {
    return ERRORS.USERNAME_TOO_SHORT;
  }
  if (username.length > 30) {
    return ERRORS.USERNAME_TOO_LONG;
  }
  if (/\s/.test(username)) {
    return ERRORS.USERNAME_HAS_SPACES;
  }
  if (password.length < 8) {
    return ERRORS.PASSWORD_TOO_SHORT;
  }
  return null;
}
