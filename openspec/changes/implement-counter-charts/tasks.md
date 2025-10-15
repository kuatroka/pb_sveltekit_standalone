# Tasks: Implement Counter with Charts

This document outlines the implementation tasks for adding a database-backed counter with 10 interactive charts to the SvelteKit + PocketBase application.

## Task Sequencing

Tasks are ordered to deliver incremental, testable user-visible progress. Dependencies are noted where parallel work is possible.

---

## Phase 1: Backend Setup (PocketBase)

### Task 1.1: Create PocketBase Collections
**Owner**: Backend/Database
**Estimated effort**: 30 minutes
**Dependencies**: None
**Parallelizable**: No (blocks all other tasks)

**Steps**:
1. Access PocketBase admin UI at `http://localhost:8090/_/`
2. Create `counters` collection with schema:
   - `id` (text, primary, manual input)
   - `value` (number, required, default: 0)
   - `updated` (date, auto-update on change)
3. Create `chart_data` collection with schema:
   - `id` (auto-generated)
   - `quarter` (text, unique, required)
   - `value` (number, required)
   - `created` (date, auto-create)
   - `updated` (date, auto-update)
4. Set API rules for both collections (allow all for MVP, refine later)

**Validation**:
- Collections visible in PocketBase admin UI
- Can manually create/edit records via admin UI
- API endpoints accessible: `/api/collections/counters/records` and `/api/collections/chart_data/records`

---

### Task 1.2: Seed Chart Data
**Owner**: Backend/Database
**Estimated effort**: 20 minutes
**Dependencies**: Task 1.1
**Parallelizable**: No

**Steps**:
1. Create seed data script or manual inserts for `chart_data`
2. Insert at least 8 quarterly records with realistic values (20-100 range)
3. Example quarters: "Q1 2023", "Q2 2023", "Q3 2023", "Q4 2023", "Q1 2024", "Q2 2024", "Q3 2024", "Q4 2024"
4. Vary values to create interesting chart patterns

**Validation**:
- Query `chart_data` collection and verify 8+ records exist
- Values are realistic and ordered chronologically
- Data fetches correctly via PocketBase SDK

---

### Task 1.3: Initialize Default Counter
**Owner**: Backend/Database
**Estimated effort**: 10 minutes
**Dependencies**: Task 1.1
**Parallelizable**: Yes (with Task 1.2)

**Steps**:
1. Create single counter record with id="main" and value=0
2. Verify upsert behavior works for this record

**Validation**:
- Counter record exists with id="main"
- Can increment/decrement via admin UI
- Only one counter record allowed (unique constraint on id)

---

## Phase 2: Frontend Dependencies & Utilities

### Task 2.1: Install uPlot Package
**Owner**: Frontend
**Estimated effort**: 10 minutes
**Dependencies**: None
**Parallelizable**: Yes (with Phase 1)

**Steps**:
1. Run `bun add uplot` in frontend directory
2. Import uPlot CSS in a global location or component that uses it
3. Verify TypeScript types are available (@types/uplot may be needed)

**Validation**:
- `uplot` appears in package.json dependencies
- Can import `import uPlot from 'uplot'` without errors
- TypeScript recognizes uPlot types

---

### Task 2.2: Create Chart Factory Utility
**Owner**: Frontend
**Estimated effort**: 2 hours
**Dependencies**: Task 2.1
**Parallelizable**: Yes (with service layer tasks)

**Steps**:
1. Create `frontend/src/lib/utils/chartFactory.ts`
2. Define `ChartConfig` interface:
   ```typescript
   interface ChartConfig {
     key: string;
     title: string;
     description: string;
     build: (labels: string[], values: number[]) => ChartBuildResult;
   }

   interface ChartBuildResult {
     series: uPlot.Series[];
     data: uPlot.AlignedData;
     extra?: { bands?, scales?, axes? };
   }
   ```
3. Implement 10 chart configurations based on inspiration repo patterns:
   - `bars` - Column chart
   - `line` - Line chart
   - `area` - Filled area chart
   - `scatter` - Scatter plot
   - `step` - Step chart
   - `spline` - Smooth spline
   - `cumulative` - Running total
   - `moving-average` - 3-quarter moving average
   - `range` - Confidence band envelope
   - `delta` - Quarter-over-quarter diverging bars
4. Export `chartConfigs` object and helper functions:
   - `labelsToIndices(labels: string[]): number[]`
   - `createChartConfig(key: string, labels: string[], values: number[], title?: string): uPlot.Options`
   - `updateChartData(chart: uPlot, key: string, labels: string[], values: number[]): void`
   - `resizeChart(chart: uPlot, container: HTMLElement): void`
5. Export `chartMetaList` for grid rendering

**Validation**:
- All 10 chart configs build without errors
- Each config returns valid uPlot options
- Helper functions handle edge cases (empty data, null values)
- Unit tests pass for chart config generation

---

### Task 2.3: Create Counter Service
**Owner**: Frontend
**Estimated effort**: 45 minutes
**Dependencies**: Task 1.1
**Parallelizable**: Yes (with Task 2.2)

**Steps**:
1. Create `frontend/src/lib/services/counterService.ts`
2. Import PocketBase client instance
3. Implement functions:
   ```typescript
   export async function getValue(): Promise<number>
   export async function increment(): Promise<number>
   export async function decrement(): Promise<number>
   ```
4. Handle upsert logic: if counter doesn't exist, create with value=0
5. Implement error handling with descriptive messages

**Validation**:
- Service functions call correct PocketBase endpoints
- Counter auto-creates on first access
- Increment/decrement return updated values
- Errors are caught and re-thrown with context

---

### Task 2.4: Create Chart Data Service
**Owner**: Frontend
**Estimated effort**: 30 minutes
**Dependencies**: Task 1.1, Task 1.2
**Parallelizable**: Yes (with Task 2.3)

**Steps**:
1. Create `frontend/src/lib/services/chartDataService.ts`
2. Implement function:
   ```typescript
   export async function getChartSeries(): Promise<{ labels: string[], values: number[] }>
   ```
3. Query PocketBase `chart_data` collection
4. Order by quarter chronologically
5. Transform to `{labels: [...], values: [...]}`format

**Validation**:
- Service fetches all chart_data records
- Data is correctly ordered
- Returned format matches chart component expectations
- Empty collection returns `{labels: [], values: []}`

---

## Phase 3: Chart Components

### Task 3.1: Create QuarterChart Component
**Owner**: Frontend
**Estimated effort**: 1.5 hours
**Dependencies**: Task 2.1, Task 2.2
**Parallelizable**: No

**Steps**:
1. Create `frontend/src/lib/components/QuarterChart.svelte`
2. Accept props using Svelte 5 runes:
   ```typescript
   let { chartKey, series = { labels: [], values: [] }, title } = $props();
   ```
3. Implement lifecycle hooks:
   - `onMount`: Create uPlot instance using chartFactory
   - `afterUpdate`: Update chart data when series changes
   - `onDestroy`: Destroy uPlot instance and remove listeners
4. Handle window resize with debounced listener
5. Normalize series data to handle null/undefined gracefully
6. Style container: responsive width, overflow handling

**Validation**:
- Component renders without errors
- Chart displays when given valid data
- Chart updates when series prop changes
- No memory leaks on mount/unmount cycles
- Resize handler works correctly

---

### Task 3.2: Create ChartGrid Component
**Owner**: Frontend
**Estimated effort**: 45 minutes
**Dependencies**: Task 3.1
**Parallelizable**: No

**Steps**:
1. Create `frontend/src/routes/counter/components/ChartGrid.svelte`
2. Accept `series` prop with chart data
3. Import `chartMetaList` from chartFactory
4. Render primary chart (bars) full-width
5. Render grid of remaining 9 charts with responsive layout:
   - 1 column on mobile
   - 2 columns on tablet (md breakpoint)
   - 3 columns on desktop (lg breakpoint)
6. Each chart card includes title and description from metadata
7. Use Tailwind/DaisyUI for styling

**Validation**:
- All 10 charts render correctly
- Grid layout is responsive
- Each chart has visible title and description
- Charts load without blocking UI

---

### Task 3.3: Create CounterControls Component
**Owner**: Frontend
**Estimated effort**: 30 minutes
**Dependencies**: Task 2.3
**Parallelizable**: Yes (with Task 3.2)

**Steps**:
1. Create `frontend/src/routes/counter/components/CounterControls.svelte`
2. Accept props:
   ```typescript
   let { counter = 0, onIncrement, onDecrement } = $props();
   ```
3. Display current counter value prominently
4. Render increment and decrement buttons
5. Emit events when buttons are clicked
6. Add loading state during async operations
7. Style using Tailwind/DaisyUI

**Validation**:
- Counter value displays correctly
- Buttons trigger correct callbacks
- Loading state prevents double-clicks
- Component is accessible (keyboard nav, ARIA labels)

---

## Phase 4: Counter Route Page

### Task 4.1: Create Counter Page Data Loader
**Owner**: Frontend
**Estimated effort**: 30 minutes
**Dependencies**: Task 2.3, Task 2.4
**Parallelizable**: Yes (with component tasks)

**Steps**:
1. Create `frontend/src/routes/counter/+page.ts`
2. Implement load function:
   ```typescript
   export async function load() {
     const [counterValue, chartSeries] = await Promise.all([
       counterService.getValue(),
       chartDataService.getChartSeries()
     ]);
     return { counterValue, chartSeries };
   }
   ```
3. Handle errors gracefully

**Validation**:
- Data loads on page navigation
- Both counter and chart data fetch in parallel
- Errors are caught and returned to page
- Loading states work correctly

---

### Task 4.2: Create Counter Page Component
**Owner**: Frontend
**Estimated effort**: 1 hour
**Dependencies**: Task 3.1, Task 3.2, Task 3.3, Task 4.1
**Parallelizable**: No

**Steps**:
1. Create `frontend/src/routes/counter/+page.svelte`
2. Import and use data from +page.ts:
   ```typescript
   let { data } = $props();
   let counter = $state(data.counterValue);
   ```
3. Implement increment/decrement handlers that call counterService
4. Update local counter state optimistically
5. Handle errors with rollback
6. Render page layout:
   - Page title and description
   - CounterControls component
   - Info card explaining database persistence
   - ChartGrid component with series data
7. Add navigation breadcrumbs or link back to home
8. Style with Tailwind/DaisyUI for consistency

**Validation**:
- Page loads with correct counter value
- Charts display below counter
- Increment/decrement updates database and UI
- Optimistic updates feel instant
- Errors show user-friendly messages
- Page layout is responsive

---

## Phase 5: Navigation & Polish

### Task 5.1: Add Counter Route to Navigation
**Owner**: Frontend
**Estimated effort**: 15 minutes
**Dependencies**: Task 4.2
**Parallelizable**: No

**Steps**:
1. Open `frontend/src/routes/+layout.svelte`
2. Add "Counter" link to navigation menu
3. Ensure link is highlighted when on /counter route
4. Test navigation from home to counter and back

**Validation**:
- Counter link appears in nav menu
- Clicking link navigates to /counter
- Active state indicates current route
- Navigation is accessible

---

### Task 5.2: Add Chart Refresh Mechanism (Optional)
**Owner**: Frontend
**Estimated effort**: 30 minutes
**Dependencies**: Task 4.2
**Parallelizable**: Yes

**Steps**:
1. Add refresh button to chart section
2. Implement handler that refetches chart data
3. Update ChartGrid with new data
4. Show loading indicator during refresh

**Validation**:
- Refresh button updates charts with latest data
- Loading state is visible
- No full page reload needed

---

### Task 5.3: Documentation & Code Comments
**Owner**: All
**Estimated effort**: 30 minutes
**Dependencies**: All previous tasks
**Parallelizable**: No

**Steps**:
1. Add JSDoc comments to service functions
2. Document chart configuration patterns in chartFactory
3. Add README section explaining counter feature
4. Document PocketBase collection schemas
5. Add inline comments for complex logic

**Validation**:
- Code is well-documented
- New developers can understand implementation
- README includes setup instructions

---

## Phase 6: Testing & Validation

### Task 6.1: Manual Testing
**Owner**: QA/Frontend
**Estimated effort**: 1 hour
**Dependencies**: Task 5.1
**Parallelizable**: No

**Steps**:
1. Test counter increment/decrement repeatedly
2. Verify persistence across page refreshes
3. Test all 10 charts render correctly
4. Test responsive layouts on mobile/tablet/desktop
5. Test error scenarios (network offline, invalid data)
6. Test browser compatibility (Chrome, Firefox, Safari)

**Validation**:
- All features work as expected
- No console errors
- Performance is acceptable
- UX is smooth and responsive

---

### Task 6.2: Unit Tests (Optional but Recommended)
**Owner**: Frontend
**Estimated effort**: 2 hours
**Dependencies**: All implementation tasks
**Parallelizable**: Yes (with Task 6.1)

**Steps**:
1. Write tests for chartFactory configurations
2. Write tests for counterService functions
3. Write tests for chartDataService functions
4. Write component tests for QuarterChart
5. Set up test fixtures and mocks

**Validation**:
- All tests pass
- Code coverage is acceptable
- Tests document expected behavior

---

## Summary

**Total estimated effort**: ~12-14 hours
**Parallelizable phases**: Tasks in Phase 2 can largely run in parallel with Phase 1
**Critical path**: Task 1.1 → Task 2.2 → Task 3.1 → Task 3.2 → Task 4.2 → Task 5.1

**Incremental delivery milestones**:
1. After Phase 1: Database schema ready for development
2. After Phase 2: Services tested and ready for UI integration
3. After Task 3.1: First chart rendering (proof of concept)
4. After Phase 4: Full feature working end-to-end
5. After Phase 5: Feature polished and integrated into app
6. After Phase 6: Feature tested and production-ready
