export function buildCacheKey(
  fnName: string,
  filterStart: Date | null | undefined,
  filterEnd: Date | null | undefined,
  recordCount: number,
  lastUpdatedAt: number
): string {
  const startStr = filterStart ? filterStart.getTime().toString() : 'null';
  const endStr = filterEnd ? filterEnd.getTime().toString() : 'null';
  return `${fnName}:${startStr}:${endStr}:${recordCount}:${lastUpdatedAt}`;
}
