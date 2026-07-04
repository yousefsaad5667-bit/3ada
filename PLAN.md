# Phase 1 — Project Foundation

## Goal

Create the project architecture that every future feature depends on.

## Deliverables

- Angular project structure
- Feature-based architecture
- Shared folder
- Core folder
- Models
- Interfaces
- Environments
- Utility functions
- Constants
- Route configuration
- Theme setup
- ESLint
- Prettier
- Folder naming conventions

### Output

A clean, scalable Angular workspace ready for feature development.

---

# Phase 2 — Local Data Layer

## Goal

Implement a fully local-first persistence layer.

## Specifications

### Storage Provider

- LocalStorage abstraction
- Generic Storage Service
- JSON serialization
- Error handling
- Storage versioning
- Data migration support

### CRUD

Support

- Create
- Read
- Update
- Delete

for

- Relapse Records
- Settings
- Dashboard Preferences

### Validation

Validate

- Required fields
- Data types
- Invalid dates
- Corrupted data

### Import / Export

Support

- Export all data
- Import JSON
- Merge strategy
- Replace strategy
- Backup download
- Restore

### Clear Data

- Remove everything
- Reset application

### Deliverables

```
StorageService

StorageRepository

ImportExportService

Validators

MigrationService
```

---

# Phase 3 — Relapse Management

## Goal

Allow users to manage relapse records.

## Specifications

Each record contains

```
Id

Date

Time

AMPM

Count

UrgeLevel

Reason

Notes
```

### Features

Create record

Edit record

Delete record

Duplicate record

View history

Search

Sort

Date filtering

Pagination (optional)

Validation

### UI

Record Form

History Table

Filters

Search Box

Delete Confirmation

### Deliverables

```
Relapse Feature

CRUD Components

Forms

Repository

Validators
```

---

# Phase 4 — Analytics Engine

## Goal

Build a reusable analytical engine.

No UI.

Every dashboard consumes this engine.

## Filtering

Support

- Last 7 Days
- Last 30 Days
- Last 90 Days
- Last Year
- Custom Range

## Aggregation

Support

- Daily
- Weekly
- Monthly

## Statistics

Calculate

- Count
- Average
- Median
- Minimum
- Maximum
- Standard Deviation
- Distribution

## Public API

```
getTimeSeries()

getDailyCounts()

getWeeklyCounts()

getMonthlyCounts()

getMovingAverage()

getDistribution()

getHeatmap()

getWeekdayAnalysis()

getHourAnalysis()

getTriggerAnalysis()

getUrgeAnalysis()

getSummaryStatistics()
```

### Requirements

Pure functions

No Angular dependencies

Reusable

Unit-testable

---

# Phase 5 — Dashboard Infrastructure

## Goal

Create the dashboard layout that hosts every visualization.

## Specifications

Dashboard Cards

Responsive Grid

Date Range Selector

Filter Bar

Refresh mechanism

Loading states

Empty states

Error states

Dashboard Preferences

Card ordering

Hidden cards

Saved layout

### Deliverables

Reusable dashboard shell.

---

# Phase 6 — Time Series Analytics

## Goal

Analyze relapse activity over time.

## Specifications

### Charts

Daily Time Series

Weekly Time Series

Monthly Time Series

Moving Average

Cumulative Count

### Raw Datasets

Daily Counts

Weekly Counts

Monthly Counts

Missing dates filled with zero

### Statistics

Trend

Growth Rate

Average

Distribution

### Deliverables

```
TimeSeriesService

TimeSeries Components

Charts

Tables
```

---

# Phase 7 — Calendar Analytics

## Goal

Visualize relapse activity on calendar views.

## Specifications

GitHub-style Heatmap

Monthly Calendar

Daily Intensity

Day Details Popup

Daily Summary

### Clicking a Day

Show

- Records
- Total Count
- Reasons
- Average Urge
- Notes

### Deliverables

Calendar components

Heatmap renderer

Calendar services

---

# Phase 8 — Time Pattern Analytics

## Goal

Discover temporal behavior patterns.

## Specifications

Weekday Analysis

Hour Analysis

AM vs PM

Hour Heatmap

Hour Distribution

Weekday Distribution

Peak Hours

Peak Days

Most Active Period

Least Active Period

### Visualizations

Bar Charts

Heatmaps

Pie Charts

Tables

---

# Phase 9 — Trigger Analytics

## Goal

Analyze relapse causes.

## Specifications

Most Common Reasons

Trigger Frequency

Trigger Distribution

Reason Timeline

Keyword Extraction

Search

Top Triggers

Rare Triggers

Average Urge per Trigger

Trend by Trigger

### Deliverables

Trigger Analytics Module

Charts

Tables

Search

---

# Phase 10 — Urge Analytics

## Goal

Analyze craving intensity.

## Specifications

Average Urge

Maximum Urge

Minimum Urge

Median Urge

Urge Time Series

Urge Distribution

Urge by Hour

Urge by Weekday

Urge by Trigger

Moving Average

Trend

Correlation with Relapse Count

### Questions Answered

- Are urges increasing?
- Are urges decreasing?
- Which trigger creates the strongest urges?
- Which weekday has the highest average urge?
- Which hour has the strongest urges?

---

# Phase 12 — Charts & Visualization

## Goal

Implement reusable visualization components.

## Specifications

Create reusable Angular wrapper components around the most suitable chart library for each visualization type (e.g., time-series, heatmap, calendar,). Select the library based on the visualization's capabilities and performance rather than using a single library for all charts. The wrappers must expose a consistent API so the rest of the application remains independent of the underlying chart library.

Supported Charts

- Line Chart
- Area Chart
- Bar Chart
- Horizontal Bar
- Pie Chart
- Doughnut Chart
- Heatmap
- Calendar Heatmap
- Histogram
- Scatter Plot

Every chart should support

- Responsive layout
- Tooltips
- Legends
- Export as PNG
- Export as SVG
- Dark mode
- Empty state

---

# Phase 14 — Performance Optimization

## Goal

Keep the application responsive even with large datasets.

## Specifications

Optimize

- LocalStorage reads
- Chart rendering
- Filtering
- Aggregation
- Change Detection
- Lazy loading
- Memoization
- Virtual scrolling (if needed)

Performance target

- Support at least 100,000 relapse records without significant UI lag.

---

# Phase 15 — Final Polish

## Goal

Prepare the application for production.

## Specifications

Accessibility

Responsive Design

Dark Mode

Animations

Error Handling

Code Cleanup

---