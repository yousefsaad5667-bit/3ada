import { Signal, WritableSignal } from '@angular/core';

/**
 * Status of the overall trigger analytics state.
 */
export type TriggerStatus = 'loading' | 'empty' | 'data' | 'error';

/**
 * Represents a single keyword trigger and its aggregated statistics. Derived from the engine's TriggerEntry.
 */
export interface TriggerBucketView {
  /** The extracted trigger keyword (Arabic or mixed) */
  keyword: string;
  /** Weighted occurrence count across all in-bounds records */
  count: number;
  /** Weighted average urge intensity (1–10 scale); null if no urge data */
  avgUrge: number | null;
  /** Percentage share of total trigger-weighted occurrences (0–100, 1 decimal) */
  percentage: number;
  /** true if this trigger is in the top 5 by count */
  isTop: boolean;
  /** true if count / totalCount < 5% AND count < 3 */
  isRare: boolean;
  /** 1-based rank by count descending (ties share the same rank) */
  rank: number;
}

/**
 * A single point in the per-trigger time series (used for the trigger timeline / trend chart).
 */
export interface TriggerTrendEntry {
  /** Date bucket (YYYY-MM-DD) */
  date: string;
  /** Arabic date label (e.g., "١٥ يوليو") */
  labelAr: string;
  /** Weighted occurrence count for the selected trigger on this date */
  count: number;
}

/**
 * The per-trigger trend series returned when a trigger is selected.
 */
export interface TriggerTrendView {
  /** The selected keyword */
  keyword: string;
  /** Date-sorted entries; zero-filled for dates with no occurrence */
  entries: TriggerTrendEntry[];
  /** Date of highest count; null if all entries are zero */
  peakDate: string | null;
  /** Trend direction (requires >= 7 entries) */
  direction: 'increasing' | 'decreasing' | 'stable' | 'insufficient-data';
  /** Arabic label for the ISO calendar week with the highest count */
  mostActivePeriodLabelAr: string | null;
}

/**
 * Aggregated distribution of all triggers for charting.
 */
export interface TriggerDistributionView {
  /** Top triggers by count (max 20 entries for chart legibility) */
  topTriggers: TriggerBucketView[];
  /** Aggregated count for triggers beyond the top 20 */
  otherCount: number;
  /** Percentage share of "other" triggers */
  otherPercentage: number;
}

/**
 * Distilled summary panel for the analytics section header.
 */
export interface TriggerSummaryView {
  /** Total distinct keywords found in the date range */
  totalKeywordCount: number;
  /** Sum of all trigger occurrences across all keywords */
  totalOccurrences: number;
  /** The #1 trigger by count; null if no data */
  topTrigger: TriggerBucketView | null;
  /** Keyword with the highest average urge; null if no urge data */
  highestUrgeKeyword: string | null;
  /** The highest average urge value; null if no urge data */
  highestAvgUrge: number | null;
  /** Count of triggers classified as rare */
  rareTriggersCount: number;
  /** Count of relapse records with no extractable trigger keywords */
  triggerlessRecordCount: number;
}

/**
 * The top-level state object produced by TriggerAnalyticsService.
 */
export interface TriggerAnalyticsState {
  /** 'empty', 'data', or 'error' */
  status: TriggerStatus;
  /** Active range start (YYYY-MM-DD) */
  rangeStart: string;
  /** Active range end (YYYY-MM-DD) */
  rangeEnd: string;
  /** Full ranked list of triggers (all keywords), sorted by count desc */
  allTriggers: TriggerBucketView[];
  /** Shorthand: top 5 triggers */
  topTriggers: TriggerBucketView[];
  /** Triggers classified as rare */
  rareTriggers: TriggerBucketView[];
  /** Chart-ready distribution for top-20 triggers */
  distribution: TriggerDistributionView;
  /** Summary statistics card data */
  summary: TriggerSummaryView;
  /** Records with no extractable keyword */
  triggerlessRecordCount: number;
  /** Arabic error message when status === 'error' */
  errorMessageAr: string | null;
}

/**
 * User-driven interaction state that lives alongside the main analytics state.
 */
export interface TriggerInteractionState {
  /** Current search filter string (case-insensitive substring match) */
  searchQuery: WritableSignal<string>;
  /** Currently selected trigger for drill-down/trend view */
  selectedKeyword: WritableSignal<string | null>;
  /** Computed: allTriggers filtered by searchQuery */
  filteredTriggers: Signal<TriggerBucketView[]>;
  /** Computed: trend series for selectedKeyword; null if none selected */
  triggerTrend: Signal<TriggerTrendView | null>;
}
