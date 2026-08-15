# Change Request

## 1. UI/UX Refinements
- **Elapse Color**: The elapse indicator color should not be green, as green implies a positive outcome which contradicts the context of tracking a "bad habit". **Proposed Change**: Change the elapse color to a more suitable alert color like orange or red.
- **Card Draggability**: The dashboard cards currently support drag-and-drop. This behavior should be removed. **Proposed Change**: Make all dashboard cards fixed so they cannot be moved.
- **Theme Color Fixes**: The cards currently have a hardcoded white background which breaks the UI in dark mode. Additionally, some text elements have hardcoded white text in light mode, making them invisible. **Proposed Change**: Implement proper CSS custom properties (variables) for card backgrounds and text colors that automatically adapt to both light and dark themes.

## 2. Global Filtering
- **Filter Placement**: Currently, the date filter is isolated inside the Dashboard (`لوحة التحكم`) component. **Proposed Change**: Extract the date filter into a global/common layout component (e.g., the top navigation or a global filter bar). This will ensure that changing the period reflects the data consistently across all open components, not just the dashboard.

## 3. Large Data Period Handling
- **UI Breaking on Large Periods**: Filtering by a large date range (e.g., 90 days) breaks the UI layouts and charts. **Proposed Change**: Implement horizontal scrolling, pagination, or a condensed/aggregated data view for charts and heatmaps to handle large date ranges gracefully without breaking the layout container.

## 4. Analytics Cards Displaying "No Data"
**Affected Cards:**
- أكثر الأسباب تكراراً (Trigger Ranking)
- ملخص المحفزات (Trigger Summary)
- مسار المحفز المحدد (Trigger Timeline)
- أبرز أوقات النشاط (Pattern Summary)
- توزيع المحفزات (Trigger Distribution)
- توزيع ساعات اليوم (Hourly Chart)
- مقارنة الصباح والمساء (Period Split)
- خريطة الوقت والأسبوع (Hour Weekday Heatmap)
- توزيع أيام الأسبوع (Weekday Chart)

**Reason for Issue:**
The dashboard uses `app-dashboard-card-shell` to dynamically mount card components. However, the affected components (like `TriggerRankingListComponent` and `PatternSummaryCardComponent`) are implemented as "dumb components" that require their data to be passed via `@Input()` decorators. Because the dynamic component shell doesn't pass these inputs dynamically, the components receive `undefined` data and subsequently display the "No Data" state, even though there are 150 records in `localStorage`. 

In contrast, working cards like `DailySeriesCardComponent` are "smart components" that successfully inject `TimeSeriesAnalyticsService` to fetch their own data directly.

**Proposed Fix:**
Refactor the implementation of these cards to match the pattern used by the time-series cards. Specifically:
- **Option A**: Create "smart" wrapper components (e.g., `TriggerRankingCardComponent`) that inject the relevant analytics service (`TriggerAnalyticsService`, `PatternAnalyticsService`), fetch the data, and pass it down to the existing dumb components. Register these new smart wrappers in `dashboard.component.ts`.
- **Option B**: Convert the existing dumb components into smart components directly by injecting the analytics services inside them and replacing the `@Input()` properties with signals reading from the services.
