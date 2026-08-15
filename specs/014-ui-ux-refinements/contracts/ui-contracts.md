# UI Contracts: UI/UX Refinements

## 1. DashboardCardShell — Smart Component Contract

Any component registered in `CARD_REGISTRY` and dynamically instantiated by `DashboardCardShellComponent` MUST implement this implicit TypeScript interface:

```typescript
interface SmartCardContract {
  /** Required: drives the shell loading/empty/error overlay */
  readonly cardState: Signal<CardState>;

  /** Optional: called by shell retry button */
  onRetry?(): void;
}
```

Where `CardState = 'loading' | 'data' | 'empty' | 'error'`

**Validation**: The shell checks for `instance.cardState` at runtime (line 32 of card-shell). If absent, it defaults to `'data'` state (no overlay).

---

## 2. New Smart Wrapper — Component Interface

Each new smart wrapper component MUST:

1. Be a standalone Angular component
2. Use `ChangeDetectionStrategy.OnPush`
3. Have selector `app-<name>-card` (following existing naming)
4. Inject the relevant analytics service (`PatternAnalyticsService` or `TriggerAnalyticsService`)
5. Expose `public readonly cardState = computed(() => this.service.state().status)`
6. Include the corresponding dumb component in its `imports` array
7. Pass data to the dumb component via template bindings (not programmatic input setting)

**Example contract (WeekdayChartCardComponent):**
```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-weekday-chart-card',
  standalone: true,
  imports: [WeekdayChartComponent],
  template: `
    <app-weekday-chart
      [weekdays]="state().weekdays"
      [status]="state().status">
    </app-weekday-chart>
  `
})
export class WeekdayChartCardComponent {
  private service = inject(PatternAnalyticsService);
  public readonly state = this.service.state;
  public readonly cardState = computed(() => this.state().status);
}
```

---

## 3. Global Filter — Placement Contract

`DateRangeSelectorComponent` renders in the `HeaderComponent`. It continues to read/write `DashboardFilterService` (already `providedIn: 'root'`). No API change.

All existing analytics components (`PatternAnalyticsService`, `TriggerAnalyticsService`, `TimeSeriesAnalyticsService`, etc.) already depend on `DashboardFilterService` — they will automatically react to filter changes regardless of which route the user is on.

---

## 4. CSS Token Contract

The following tokens MUST be defined in both `[data-theme='dark']` and `[data-theme='light']` blocks (and the `@media prefers-color-scheme:light` fallback) in `_themes.scss`:

| Token | Light value | Dark value | Purpose |
|---|---|---|---|
| `--color-elapse-indicator` | `#ea580c` (orange-600) | `#fb923c` (orange-400) | Elapsed/progress indicator for bad-habit context |
| `--color-surface` | `#ffffff` | `#1e293b` | Alias for `--color-bg-card` (compat) |
| `--color-text-muted` | `#64748b` | `#94a3b8` | Muted / secondary text |
| `--color-bg-surface-secondary` | `#f8fafc` | `#0f172a` | Subtle elevated surface |
| `--color-danger` | `#d32f2f` | `#ef4444` | Danger/error actions |

---

## 5. Chart Scroll Contract

Chart containers requiring large-range scrolling MUST apply:

```scss
.chart-scroll-container {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch; // smooth iOS scroll
}

.chart-inner {
  min-width: <breakpoint>; // chart-specific minimum to keep cells readable
}
```

Affected components:
- `weekday-chart.component.scss` — inner bar chart
- `hourly-chart.component.scss` — inner bar chart  
- `hour-weekday-heatmap.component.scss` — inner grid (`min-width: 600px`)
- `trigger-timeline.component.scss` — timeline entries list
