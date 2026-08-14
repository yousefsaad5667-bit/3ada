# Quickstart: Urge Analytics (Phase 10)

## Purpose

This document gives an implementer everything they need to start coding Phase 10 without reading the full plan.

---

## Branch

```bash
git checkout 010-urge-analytics
```

## Dev Server

```bash
npm start        # already running; navigate to http://localhost:4200/analytics/urge
```

---

## What Already Exists

| File | Status |
|---|---|
| `src/app/core/analytics/engine/urge.engine.ts` | ✅ Exists — has `getUrgeAnalysis` (summary + time series) |
| `src/app/core/analytics/engine/urge.engine.spec.ts` | ✅ Exists — 2 tests passing |
| `src/app/core/analytics/models/analytics.types.ts` | ✅ Exists — has `UrgeAnalysisResult`; needs 4 new types |
| `src/app/core/analytics/index.ts` | ✅ Exists — exports `getUrgeAnalysis` |
| `src/app/features/analytics/urge/urge.component.ts` | ✅ Exists — empty skeleton |
| `src/app/app.routes.ts` | ✅ Route `analytics/urge` already registered |

## What Needs To Be Built

### Step 1 — Extend Types (`analytics.types.ts`)

Add:
- `UrgeHourEntry`
- `UrgeWeekdayEntry`
- `UrgeTriggerEntry`
- `UrgeCorrelationResult`

(See `data-model.md` for exact field definitions.)

### Step 2 — Extend Engine (`urge.engine.ts`)

Add three new exported pure functions:

```typescript
export function getUrgeByHour(records: RelapseRecord[]): UrgeHourEntry[]
export function getUrgeByWeekday(records: RelapseRecord[]): UrgeWeekdayEntry[]
export function getUrgeCorrelation(records: RelapseRecord[], dateRange: DateRange): UrgeCorrelationResult
```

Re-use `getTriggerAnalysis` output — no new engine function needed for trigger-urge ranking.

Also extend `urge.engine.spec.ts` with tests for the new functions.

### Step 3 — Update Barrel (`index.ts`)

Export new types and the three new engine functions.

### Step 4 — Create View Model (`urge-view.model.ts`)

Create `src/app/features/analytics/urge/models/urge-view.model.ts` with:
- `UrgeStatus`
- `UrgeSummaryView`
- `UrgeTimeSeriesView`
- `UrgeAnalyticsState`

(See `data-model.md` for exact definitions.)

### Step 5 — Create Service (`urge-analytics.service.ts`)

Create `src/app/features/analytics/urge/services/urge-analytics.service.ts`.

Follow the `TriggerAnalyticsService` pattern exactly:
- Inject `DashboardFilterService` and `RelapseRecordRepository`
- Expose `state: Signal<UrgeAnalyticsState>` as a `computed` signal
- Handle `status: 'empty'`, `'data'`, `'error'`
- Produce all sub-views inside the single `computed` (no nested computeds needed)

```typescript
@Injectable({ providedIn: 'root' })
export class UrgeAnalyticsService {
  private filterService = inject(DashboardFilterService);
  private repository = inject(RelapseRecordRepository);

  public readonly state: Signal<UrgeAnalyticsState> = computed(() => {
    // ...
  });

  private createEmptyState(start: string, end: string, excluded: number): UrgeAnalyticsState { ... }
}
```

### Step 6 — Create Service Spec (`urge-analytics.service.spec.ts`)

Key test cases to cover:
- Empty records → `status: 'empty'`
- Records with no urge data → `status: 'empty'` + `excludedRecordCount` set
- Records with full data → all sub-views populated
- Correlation insufficient data (< 10 weeks) → `direction: 'insufficient-data'`

### Step 7 — Create Sub-Components (7 total)

Each is a standalone Angular component with `@Input({ required: true })`.

**Skeleton to copy-paste for each**:
```typescript
@Component({
  selector: 'app-urge-summary-card',
  standalone: true,
  imports: [],
  templateUrl: './urge-summary-card.component.html',
  styleUrl: './urge-summary-card.component.scss',
})
export class UrgeSummaryCardComponent {
  @Input({ required: true }) summary!: UrgeSummaryView;
}
```

See `contracts/urge-contracts.md` for all display rules.

### Step 8 — Wire Up Root Component

Replace the skeleton `UrgeComponent`:

```typescript
@Component({
  selector: 'app-urge',
  standalone: true,
  imports: [
    UrgeSummaryCardComponent,
    UrgeTimeSeriesChartComponent,
    UrgeDistributionChartComponent,
    UrgeByHourChartComponent,
    UrgeByWeekdayChartComponent,
    UrgeByTriggerListComponent,
    UrgeCorrelationCardComponent,
  ],
  templateUrl: './urge.component.html',
  styleUrl: './urge.component.scss',
})
export class UrgeComponent {
  public service = inject(UrgeAnalyticsService);
  public state = this.service.state;
}
```

---

## Key Patterns from Existing Codebase

### Inject filter + repository
```typescript
private filterService = inject(DashboardFilterService);
private repository = inject(RelapseRecordRepository);
```

### Reactive state computation
```typescript
public readonly state = computed<UrgeAnalyticsState>(() => {
  const filter = this.filterService.activeFilter();
  const records = this.repository.records();
  const startStr = filter.startDate.toISOString().split('T')[0];
  const endStr = filter.endDate.toISOString().split('T')[0];
  // ...
});
```

### Arabic month names (from urge.engine.ts)
```typescript
const monthNamesAr = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
```

### Arabic date formatting (from shared utils)
```typescript
import { formatArabicDate } from '../../../../shared/utils/date.utils';
```

---

## Correlation Algorithm (Pearson, weekly buckets)

```typescript
// 1. Get weekly buckets from existing getWeeklyCounts
// 2. For each week bucket: also compute avg urge for that week's records
// 3. Build two vectors: weeklyRelapseCounts[], weeklyAvgUrges[]
// 4. Keep only weeks where BOTH have data (at least 1 urge record + at least 1 relapse)
// 5. If vector length < 10: return { direction: 'insufficient-data', ... }
// 6. Compute Pearson r using standard formula
// 7. r >= 0.3 → positive; r <= -0.3 → negative; else neutral
```

---

## Running Tests

```bash
npx ng test --include="**/urge*" --watch=false
```

---

## Files NOT to Touch

- `src/app/app.routes.ts` — route already exists
- `src/app/core/analytics/engine/statistics.engine.ts` — re-used as-is
- `src/app/core/analytics/engine/trigger.engine.ts` — re-used as-is
- `src/app/core/analytics/engine/pattern.engine.ts` — re-used as-is
- Any existing engine spec files
