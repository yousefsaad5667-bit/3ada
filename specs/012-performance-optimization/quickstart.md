# Quickstart: Performance Optimization

**Feature**: Performance Optimization (Phase 14)
**Date**: 2026-08-15

---

## Prerequisites

- Angular 19 project already set up
- `@angular/cdk` available (already a transitive dependency — no install needed)
- All previous phases (001–011) implemented

---

## What This Feature Does

Ensures the app stays fast with 100,000+ relapse records by applying five targeted optimizations:

1. **`OnPush` Change Detection** — prevents unnecessary component re-renders
2. **Analytics Memoization** — caches expensive computation results for the session
3. **Virtual Scrolling** — renders only visible rows in large lists
4. **Search Debounce** — prevents repeated recomputation on every keystroke
5. **Non-blocking Import** — yields the UI thread during large JSON imports

---

## Implementation Order

The tasks must be applied in this order to avoid regressions:

```
Step 1: Add AnalyticsMemoService (new service — no breaking changes)
Step 2: Wire memoization into analytics services (computed() wrappers)
Step 3: Add trackBy to all *ngFor (safe, no behavior change)
Step 4: Apply OnPush to all components (safe with signals)
Step 5: Add virtual scrolling to RecordTableComponent
Step 6: Add 150ms debounce to search inputs
Step 7: Make ImportExportService.import non-blocking
Step 8: Audit and fix memory leaks (effect cleanup, chart destroy)
Step 9: Benchmark and verify against success criteria
```

---

## Key Files Touched

| File | Change |
|---|---|
| `src/app/core/analytics/services/analytics-memo.service.ts` | **NEW** — memoization cache |
| `src/app/core/services/relapse-record.repository.ts` | **MODIFY** — call `memoService.clearAll()` on every write |
| `src/app/core/services/import-export.service.ts` | **MODIFY** — chunked non-blocking import |
| `src/app/features/relapses/components/record-table/record-table.component.ts` | **MODIFY** — virtual scrolling + OnPush + trackBy |
| `src/app/features/relapses/components/record-table/record-table.component.html` | **MODIFY** — `CdkVirtualScrollViewport` + `*cdkVirtualFor` |
| `src/app/features/analytics/*/services/*.service.ts` | **MODIFY** — wrap computed() bodies with `memoService.memoize()` |
| `src/app/features/analytics/**/*.component.ts` | **MODIFY** — add `OnPush` |
| `src/app/shared/components/charts/**/*.component.ts` | **MODIFY** — add `OnPush` |
| `src/app/features/dashboard/**/*.component.ts` | **MODIFY** — add `OnPush` |
| `src/app/features/relapses/relapses.component.ts` | **MODIFY** — debounce search input |

---

## AnalyticsMemoService — Core Pattern

```typescript
// src/app/core/analytics/services/analytics-memo.service.ts
@Injectable({ providedIn: 'root' })
export class AnalyticsMemoService {
  private cache = new Map<string, unknown>();
  private readonly _cacheSize = signal(0);
  readonly cacheSize = this._cacheSize.asReadonly();

  memoize<T>(key: string, compute: () => T): T {
    if (this.cache.has(key)) {
      return this.cache.get(key) as T;
    }
    const result = compute();
    this.cache.set(key, result);
    this._cacheSize.set(this.cache.size);
    return result;
  }

  clearAll(): void {
    this.cache.clear();
    this._cacheSize.set(0);
  }
}
```

---

## Cache Key Helper

```typescript
// src/app/core/analytics/utils/cache-key.util.ts
export function buildCacheKey(
  fnName: string,
  filterStart: string,
  filterEnd: string,
  recordCount: number,
  lastUpdatedAt: string
): string {
  return `${fnName}:${filterStart}:${filterEnd}:${recordCount}:${lastUpdatedAt}`;
}
```

---

## OnPush Pattern (all components)

```typescript
@Component({
  // ...
  changeDetection: ChangeDetectionStrategy.OnPush,  // ← add this
})
```
Templates already use `signal()` read syntax — no other changes needed.

---

## Virtual Scrolling Pattern

```typescript
// record-table.component.ts
import { ScrollingModule } from '@angular/cdk/scrolling';

@Component({
  imports: [CommonModule, ScrollingModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecordTableComponent {
  readonly ROW_HEIGHT = 48;
  trackById = (_: number, r: RelapseRecord) => r.id;
}
```

```html
<!-- record-table.component.html -->
<cdk-virtual-scroll-viewport [itemSize]="ROW_HEIGHT" class="table-viewport">
  <table>
    <tbody>
      <tr *cdkVirtualFor="let record of records; trackBy: trackById">
        <!-- existing row content unchanged -->
      </tr>
    </tbody>
  </table>
</cdk-virtual-scroll-viewport>
```

---

## Debounce Pattern

```typescript
// relapses.component.ts
private searchDebounce: ReturnType<typeof setTimeout> | null = null;

onSearchChange(value: string): void {
  if (this.searchDebounce) clearTimeout(this.searchDebounce);
  this.searchDebounce = setTimeout(() => {
    this.searchQuery.set(value);
  }, 150);
}
```

---

## Chunked Import Pattern

```typescript
// import-export.service.ts
private readonly _importProgress = signal<ImportProgress>({ status: 'idle', ... });
readonly importProgress = this._importProgress.asReadonly();

importRecordsNonBlocking(jsonBlob: string, strategy: 'merge' | 'replace'): void {
  const records = JSON.parse(jsonBlob) as RelapseRecord[];
  const CHUNK = 500;
  let offset = 0;

  this._importProgress.set({ status: 'importing', totalRecords: records.length, processedRecords: 0, percentComplete: 0, errorMessageAr: null });

  const processChunk = () => {
    const chunk = records.slice(offset, offset + CHUNK);
    chunk.forEach(r => this.repo.importSingle(r, strategy));
    offset += CHUNK;
    this._importProgress.update(p => ({ ...p, processedRecords: offset, percentComplete: Math.round(offset / records.length * 100) }));

    if (offset < records.length) {
      setTimeout(processChunk, 0);  // yield to UI thread
    } else {
      this._importProgress.update(p => ({ ...p, status: 'done' }));
    }
  };

  setTimeout(processChunk, 0);
}
```

---

## Verification Checklist

After all changes:

- [ ] `ng build` completes without errors
- [ ] `ng test` — all existing tests pass
- [ ] Manual: Open History with 100k seeded records → visible in < 1 s
- [ ] Manual: Type in search box → results appear within 300 ms
- [ ] Manual: Switch date range → charts update within 500 ms
- [ ] Manual: Cold reload with 100k records → interactive in < 3 s
- [ ] Manual: 100k-record JSON import → UI stays responsive during import
- [ ] Browser DevTools: Memory stable over 30 min browsing session
