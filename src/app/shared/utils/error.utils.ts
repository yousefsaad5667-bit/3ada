export function handleStorageError(error: unknown): string {
  console.error('Storage Error:', error);
  return 'حدث خطأ أثناء الوصول إلى التخزين المحلي.';
}
