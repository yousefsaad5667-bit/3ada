# Implementation Plan: Analytics Engine

**Branch**: `004-analytics-engine` | **Date**: 2026-07-04 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/004-analytics-engine/spec.md`

---

## Summary

Build a **pure TypeScript analytics engine** — a collection of stateless, framework-free functions that accept `RelapseRecord[]` arrays and return structured data objects for consumption by Angular dashboard components. The engine provides time-series aggregation (daily/weekly/monthly), statistical summaries, and behavioral pattern analysis (weekday, hour, trigger, urge). It is intentionally UI-free and Angular-free so it remains independently testable and reusable across all future dashboard phases.

---

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode, no `any`)

**Primary Dependencies**: None — zero external packages. Uses only browser-native `Date` APIs.

**Storage**: N/A — the engine receives records as arguments; it does not read from LocalStorage directly.

**Testing**: `ng test` (Karma/Jasmine, already configured in the project) for unit tests; pure functions are also testable with plain Node + ts-node without Angular.

**Target Platform**: Browser (Angular application); functions are also invocable in non-browser environments for testing.

**Project Type**: Internal TypeScript module (pure function library); no Angular decorators.

**Performance Goals**: All functions must complete within 500 ms for 100,000 input records on a modern browser.

**Constraints**: Zero Angular imports anywhere in engine source files. No IndexedDB, no REST, no backend.

**Scale/Scope**: Up to 100,000 `RelapseRecord` entries per invocation.

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| Angular Platform (no backend, no server) | ✅ PASS | Engine is pure TS; consumed by Angular services — no violation |
| 100% Local-First (LocalStorage only) | ✅ PASS | Engine receives data as args — it never reads/writes storage directly |
| Arabic Language & RTL | ✅ PASS | Weekday labels in Arabic; no UI in this phase |
| Modern UI & UX | ✅ PASS | No UI in this phase; outputs are consumed by UI phases |
| Performance ≥ 100k records | ✅ PASS | Performance target explicitly included in spec (SC-002) |
| Feature-based architecture | ✅ PASS | Engine lives in `src/app/core/analytics/` — shared core layer |
| Code Quality (strict typing, no duplication) | ✅ PASS | Pure functions, strict types, modular files |

**All gates pass. Ready to proceed.**

---

## Project Structure

### Documentation (this feature)

```text
specs/004-analytics-engine/
├── plan.md              ← This file
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
├── contracts/           ← Phase 1 output (public API contracts)
│   └── analytics-api.md
├── quickstart.md        ← Phase 1 output
└── tasks.md             ← Phase 2 output (/speckit-tasks — NOT created here)
```

### Source Code (repository root)

```text
src/app/core/analytics/
├── models/
│   ├── analytics.types.ts          ← DateRange, DatePreset, TimeSeriesEntry, WeekdayEntry,
│   │                                  HourEntry, TriggerEntry, SummaryStatistics, HeatmapEntry
│   └── analytics-granularity.types.ts  ← Granularity enum: 'daily' | 'weekly' | 'monthly'
├── utils/
│   └── date-range.utils.ts         ← getDateRangeBounds(), formatISO(), iterateDateRange()
├── engine/
│   ├── time-series.engine.ts       ← getTimeSeries(), getDailyCounts(), getWeeklyCounts(), getMonthlyCounts()
│   ├── statistics.engine.ts        ← getSummaryStatistics(), getMovingAverage(), getDistribution()
│   ├── pattern.engine.ts           ← getWeekdayAnalysis(), getHourAnalysis()
│   ├── trigger.engine.ts           ← getTriggerAnalysis()
│   └── urge.engine.ts              ← getUrgeAnalysis()
├── heatmap.engine.ts               ← getHeatmap()
└── index.ts                        ← Re-exports all public functions
```

**Structure Decision**: The engine lives under `src/app/core/analytics/` — the shared `core/` layer that already houses models, services, validators, and constants. This makes it accessible to all future feature modules (dashboard, charts, time-series views) via clean Angular injection in a wrapper service, while keeping the raw functions framework-free.

---

## Verification Plan

### Automated Tests

- Unit tests for every engine function using `ng test` (Karma/Jasmine).
- Key test cases: empty array, single record, records with null fields, 100k-record performance assertion.

### Manual Verification

- Call each engine function from a temporary dev component or browser console with mock data; compare outputs against hand-calculated values.
- Confirm no Angular imports exist in engine files via static grep.
