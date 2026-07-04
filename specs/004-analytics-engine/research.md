# Research: Analytics Engine

**Feature**: `004-analytics-engine`
**Date**: 2026-07-04
**Status**: Complete — all NEEDS CLARIFICATION resolved

---

## Decision 1: Date Arithmetic Strategy

**Decision**: Use only browser-native `Date` API — no external library (no date-fns, no Luxon, no Day.js).

**Rationale**: The engine's only date operations are: (1) iterate day-by-day over a range, (2) extract ISO week number, (3) extract year-month for monthly grouping. All three are achievable with `Date` arithmetic in under 30 lines. Adding a date library introduces bundle overhead and a dependency to maintain for no meaningful complexity reduction at this scale.

**Alternatives considered**:
- **date-fns**: Excellent, tree-shakable. Rejected — the engine needs only 5-6 utility functions; pulling a library for this would be over-engineering.
- **Luxon**: Full-featured, immutable. Rejected — same reason; also heavier bundle.
- **Day.js**: Lightweight. Rejected — still an unnecessary dependency given the limited date operations needed.

---

## Decision 2: ISO Week Numbering

**Decision**: Implement a small, inline ISO 8601 week-number function (< 10 lines). Week starts on Monday; week 1 is the week containing the first Thursday of the year.

**Rationale**: The spec requires `getWeeklyCounts()` to produce one entry per ISO week. Arabic calendar conventions align with ISO 8601 for business reporting purposes. No standard `Date` API method exposes ISO week number, so a small utility is required.

**Alternatives considered**:
- **Use Sunday-based US week numbers**: Rejected — less standard globally; ISO 8601 is the international standard.
- **Use date-fns `getISOWeek()`**: Rejected — same rationale as Decision 1.

---

## Decision 3: Keyword Extraction for Trigger Analysis

**Decision**: Simple whitespace tokenization + lowercase normalization + Arabic stop-word filtering. Stop words include common Arabic function words (في، من، إلى، على، مع، هذا، هذه، لا، لم، كان، يكون، etc.) and single-character tokens.

**Rationale**: The spec requires "keyword extraction from reason/notes fields." A simple tokenizer is sufficient to surface meaningful trigger patterns. Full NLP (stemming, morphological analysis) would be a significant complexity increase with marginal gain given the app's domain and scale.

**Alternatives considered**:
- **Arabic NLP library (e.g., farasa)**: Rejected — no Angular-compatible browser bundle; adds significant bundle weight; overkill for keyword frequency counting.
- **TF-IDF weighting**: Rejected — unnecessary for this use case; simple frequency ranking gives actionable results.

---

## Decision 4: `getDistribution()` Scope

**Decision**: `getDistribution(records, field)` works over numeric fields (`urgeLevel`, `count`). For `urgeLevel` (1–10), it returns a bucket per integer value. For `count`, it returns configurable equal-width buckets (default: 10 buckets from min to max).

**Rationale**: The spec mentions distribution as a statistic. Urge level is already a discrete 1–10 scale, making per-value distribution natural. Count distribution needs bucketing since values can vary widely.

**Alternatives considered**:
- **Fixed 5-bucket histogram for all fields**: Rejected — loses resolution for urge level which only spans 10 values.
- **Percentile-based buckets**: Rejected — harder to explain to users; equal-width buckets are more intuitive.

---

## Decision 5: Shared `DatePreset` type

**Decision**: Define a canonical `DatePreset` type and `getDateRangeBounds()` function in `src/app/core/analytics/utils/date-range.utils.ts`. The existing `DatePreset` type in `src/app/features/relapses/models/record-filter.types.ts` is feature-scoped and will be superseded by the core one. The relapses feature will import from the new core location.

**Rationale**: `DatePreset` and `getDateRangeBounds()` are already partially implemented in the relapses feature. Keeping them there leads to duplication as more features need them. Moving the canonical definition to `core/analytics/` makes it the single source of truth.

**Migration path**: After the engine is implemented, update the relapses feature's `record-filter.types.ts` to re-export from the core analytics module (backward-compatible alias) or update its import directly.

---

## Decision 6: Engine Delivery Format

**Decision**: The engine is delivered as a set of named pure functions exported from `src/app/core/analytics/index.ts`. Angular components and services import specific functions they need. An optional thin Angular service wrapper (`AnalyticsEngineService`) can be provided as a convenience injectable that delegates to the pure functions — but the pure functions themselves remain the canonical API.

**Rationale**: Pure functions are directly testable without Angular's TestBed. The optional Angular service wrapper provides dependency injection benefits (mock-ability in component tests) without coupling the engine to Angular.
