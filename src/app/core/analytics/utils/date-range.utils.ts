import { DatePreset, DateRange } from '../models/analytics.types';

/**
 * Resolves a DatePreset or custom DateRange into a canonical `{ from, to }` range
 * formatted as 'YYYY-MM-DD' strings.
 *
 * @param preset The named preset ('today', 'last7', 'last30', etc.) or 'custom' or 'all'
 * @param custom The custom DateRange object (required if preset === 'custom')
 * @returns The resolved DateRange, or null if preset is 'all'
 */
export function getDateRangeBounds(
  preset: DatePreset,
  custom?: DateRange
): DateRange | null {
  if (preset === 'all') {
    return null;
  }

  if (preset === 'custom') {
    return custom || null;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const to = new Date(today);
  to.setHours(23, 59, 59, 999);

  const from = new Date(today);

  switch (preset) {
    case 'today':
      // 'from' is already today
      break;
    case 'last7':
      from.setDate(today.getDate() - 6); // 6 days ago + today = 7 days
      break;
    case 'last30':
      from.setDate(today.getDate() - 29); // 29 days ago + today = 30 days
      break;
    case 'last90':
      from.setDate(today.getDate() - 89);
      break;
    case 'lastYear':
      from.setFullYear(today.getFullYear() - 1);
      // to make it exactly 365 days or 1 year:
      from.setDate(from.getDate() + 1); // 1 year ago + 1 day
      break;
  }

  return {
    from: formatISO(from),
    to: formatISO(to),
  };
}

/**
 * Formats a Date object into a 'YYYY-MM-DD' string.
 */
export function formatISO(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${String(year)}-${month}-${day}`;
}

/**
 * Returns the number of days between two 'YYYY-MM-DD' dates, inclusive.
 * Returns 0 if from is after to.
 */
export function numberOfDays(from: string, to: string): number {
  const fromDate = new Date(`${from}T00:00:00`);
  const toDate = new Date(`${to}T00:00:00`);

  if (fromDate > toDate) {
    return 0;
  }

  const msPerDay = 1000 * 60 * 60 * 24;
  // Use UTC to avoid daylight saving time issues
  const utcFrom = Date.UTC(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
  const utcTo = Date.UTC(toDate.getFullYear(), toDate.getMonth(), toDate.getDate());

  return Math.floor((utcTo - utcFrom) / msPerDay) + 1;
}

/**
 * Generates an array of all 'YYYY-MM-DD' strings between from and to, inclusive.
 */
export function iterateDateRange(from: string, to: string): string[] {
  const count = numberOfDays(from, to);
  if (count === 0) return [];

  const dates: string[] = [];
  const currentDate = new Date(`${from}T00:00:00`);

  for (let i = 0; i < count; i++) {
    dates.push(formatISO(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
}

/**
 * Validates if a string is a valid 'YYYY-MM-DD' date string.
 */
export function isValidDate(dateString: string): boolean {
  if (!dateString) return false;
  const d = new Date(`${dateString}T00:00:00`);
  return !isNaN(d.getTime());
}
