export function handleStorageError(error: unknown): string {
  // eslint-disable-next-line no-console
  console.error('Storage Error:', error);
  return 'حدث خطأ أثناء الوصول إلى التخزين المحلي.';
}
