export function formatArabicDate(date: Date): string {
  return new Intl.DateTimeFormat('ar-SA').format(date);
}

export function formatArabicTime(date: Date): string {
  return new Intl.DateTimeFormat('ar-SA', { hour: 'numeric', minute: 'numeric' }).format(date);
}
