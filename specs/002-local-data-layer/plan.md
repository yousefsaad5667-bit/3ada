# Implementation Plan: Local Data Layer

**Branch**: `002-local-data-layer` | **Date**: 2026-07-04 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/002-local-data-layer/spec.md`

## Summary

Implement a fully local-first persistence layer for the Habit Tracker application. This phase delivers
a typed `StorageService` abstraction over `localStorage`, three domain repositories (RelapseRecord,
Settings, DashboardPreferences), input validators with Arabic error messages, a schema-versioning and
migration system, and a full import/export service. No UI components are created in this phase — this
is a pure services/models/utilities layer that all future phases consume.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode), Angular 19.x (latest stable)

**Primary Dependencies**:
- `@angular/core` (Injectable services, Signals for reactive state)
- Browser `localStorage` Web API (no additional storage libraries)
- `crypto.randomUUID()` (native browser API for ID generation — no library needed)

**Storage**: `localStorage` exclusively — JSON-serialized strings at namespaced keys prefixed with `habit-tracker-`

**Testing**: Angular CLI default (Karma + Jasmine); all services and validators to have unit tests

**Target Platform**: Modern evergreen browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+) — client-side only

**Project Type**: Angular SPA — pure data/services layer, no UI components in this phase

**Performance Goals**:
- Storage read for 10,000 records: < 50ms
- Export of 10,000 records: < 3 seconds (including file download trigger)
- Import of 10,000-record JSON: < 5 seconds
- Schema migration on app load: < 200ms

**Constraints**: 100% offline, no network calls, no external libraries, Arabic-only error text, RTL-agnostic (services have no UI dependency)

**Scale/Scope**: ~10,000 relapse records as practical max; schema version 1 as initial baseline

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|---|---|---|
| I. Angular Platform | ✅ PASS | Pure Angular `@Injectable` services, TypeScript strict mode, Signals for reactive state; no backend |
| II. 100% Local-First | ✅ PASS | All writes go to `localStorage` only; zero network calls; fully offline |
| III. Arabic & RTL | ✅ PASS | All validation error messages and user notifications output Arabic text |
| IV. Modern UI/UX | ✅ PASS | Error/empty/loading states exposed via service APIs for upstream components to consume |
| V. Performance | ✅ PASS | Targets set: 50ms read, 3s export, 5s import, 200ms migration |
| Charting Library | ⏭ N/A | Not applicable — no UI in this phase |
| Architecture | ✅ PASS | Repository pattern, dependency injection, separation of concerns, SOLID |
| Code Quality | ✅ PASS | Strict TypeScript, no `any`, all interfaces defined, full error handling |
| Deliverables | ✅ PASS | Services, repositories, models, validators, migration system all planned |

**Gate Result**: ✅ ALL PASS — Proceeding to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/002-local-data-layer/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── service-contracts.md
└── tasks.md             # Phase 2 output (speckit-tasks)
```

### Source Code (repository root)

```text
src/app/core/
├── models/
│   ├── relapse-record.model.ts           # RelapseRecord interface + field types
│   ├── settings.model.ts                 # Settings interface
│   ├── dashboard-preferences.model.ts    # DashboardPreferences interface
│   ├── export-bundle.model.ts            # ExportBundle interface
│   ├── storage-version.model.ts          # StorageVersion interface
│   ├── validation-result.model.ts        # ValidationResult<T> generic type
│   └── import-strategy.model.ts          # ImportStrategy union type ('replace' | 'merge')
│
├── constants/
│   ├── storage.constants.ts              # (EXISTS — extend with new domain keys)
│   └── storage-version.constants.ts      # CURRENT_SCHEMA_VERSION = 1
│
├── services/
│   ├── storage.service.ts                # (EXISTS — extend with getAllKeys() helper)
│   ├── relapse-record.repository.ts      # Full CRUD for RelapseRecord
│   ├── settings.repository.ts            # CRU for Settings (no delete)
│   ├── dashboard-preferences.repository.ts # CRU for DashboardPreferences (no delete)
│   ├── migration.service.ts              # Schema versioning + sequential migration runner
│   └── import-export.service.ts          # Export all / Import (replace | merge) / Clear all
│
└── validators/
    ├── relapse-record.validator.ts        # FR-007 field validation with Arabic messages
    ├── settings.validator.ts              # FR-008 settings validation
    └── export-bundle.validator.ts         # FR-014 import bundle schema validation
```

**Structure Decision**: Single-project Angular SPA. All data-layer code lives under `src/app/core/` following the established pattern from Phase 1. No new top-level directories are required.
