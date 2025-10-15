# Design: Counter with Charts Implementation

## Architecture Overview

This implementation adapts the Phoenix LiveView + LiveSvelte counter pattern to a SvelteKit + PocketBase architecture, maintaining similar UX while leveraging SvelteKit's client-side reactivity and PocketBase's REST API.

## System Components

### Frontend (SvelteKit)
```
src/routes/counter/
├── +page.svelte          # Main counter route component
├── +page.ts              # Data loading function
└── components/
    ├── CounterControls.svelte    # Increment/decrement buttons
    └── ChartGrid.svelte          # Chart display grid
src/lib/
├── components/
│   └── QuarterChart.svelte       # Reusable chart component
├── services/
│   ├── counterService.ts         # Counter API calls
│   └── chartDataService.ts       # Chart data API calls
├── stores/
│   └── counterStore.ts           # Counter state management
└── utils/
    └── chartFactory.ts           # uPlot chart configurations
```

### Backend (PocketBase)
```
Collections:
- counters
  - id (text, primary key, default: "main")
  - value (number, default: 0)
  - updated (datetime, auto)

- chart_data
  - id (auto)
  - quarter (text, unique, e.g., "Q1 2024")
  - value (number)
  - category (text, optional, for chart type differentiation)
  - created (datetime, auto)
  - updated (datetime, auto)
```

## Data Flow

### Counter Operations
1. User clicks increment/decrement button
2. Component dispatches action to counterService
3. counterService makes PATCH request to PocketBase
4. PocketBase updates counter record
5. Response returns updated value
6. Component updates local state
7. UI re-renders with new value

### Chart Data Flow
1. Page load triggers chart data fetch via +page.ts
2. chartDataService queries PocketBase chart_data collection
3. Data is transformed into chart-ready format
4. QuarterChart components receive data as props
5. uPlot renders charts in mounted lifecycle
6. Charts update reactively when data changes

## Chart Types (10 Total)

Based on the Phoenix LiveView reference implementation:

1. **Bars** - Column chart of raw quarterly values
2. **Line** - Simple line chart showing trends
3. **Area** - Line with filled area under curve
4. **Scatter** - Points-only distribution view
5. **Step** - Step chart for discrete changes
6. **Spline** - Smoothed curve interpolation
7. **Cumulative** - Running total overlay
8. **Moving Average** - 3-quarter moving average
9. **Range** - Confidence band envelope (±5 units)
10. **Delta** - Quarter-over-quarter change (diverging bars)

## Chart Factory Pattern

The `chartFactory.ts` utility will export configuration builders for each chart type:

```typescript
interface ChartConfig {
  key: string;
  title: string;
  description: string;
  build: (labels: string[], values: number[]) => uPlot.Options;
}

export const chartConfigs: Record<string, ChartConfig> = {
  bars: { /* ... */ },
  line: { /* ... */ },
  // ... 8 more configurations
};
```

## Component Hierarchy

```
+page.svelte (Counter Route)
├── CounterControls.svelte
│   ├── Button (Increment)
│   └── Button (Decrement)
└── ChartGrid.svelte
    ├── QuarterChart.svelte (bars)
    ├── QuarterChart.svelte (line)
    ├── QuarterChart.svelte (area)
    ├── QuarterChart.svelte (scatter)
    ├── QuarterChart.svelte (step)
    ├── QuarterChart.svelte (spline)
    ├── QuarterChart.svelte (cumulative)
    ├── QuarterChart.svelte (moving-average)
    ├── QuarterChart.svelte (range)
    └── QuarterChart.svelte (delta)
```

## State Management

### Counter State
- Single source of truth in PocketBase `counters` collection
- Local component state for optimistic updates
- Error handling for failed updates with rollback

### Chart Data State
- Loaded once on page mount via +page.ts
- Cached in component props
- Refresh mechanism via button or automatic polling (optional)

## Styling Approach

- Use Tailwind CSS classes for layout and styling
- DaisyUI components for buttons and cards (if available, otherwise pure Tailwind)
- Grid layout for charts (responsive: 1 col mobile, 2 cols tablet, 3 cols desktop)
- Consistent spacing and visual hierarchy

## Performance Considerations

1. **Chart Rendering**: Charts created only once in `onMount`, updated via `setData`
2. **Data Fetching**: Single batch request for all chart data
3. **Resize Handling**: Debounced window resize listener for chart reflows
4. **Component Lazy Loading**: Consider code-splitting for chart components if bundle size is concern

## Error Handling

- Network errors: Display toast notifications, retry logic
- Invalid data: Graceful fallbacks, empty state messages
- Chart rendering errors: Try-catch in chart initialization, error boundaries

## Testing Strategy

- Unit tests for chartFactory configurations
- Unit tests for service layer API calls
- Component tests for CounterControls interactions
- Integration tests for full counter + chart flow
- Visual regression tests for chart rendering (optional)

## Migration Path

1. Create PocketBase collections via admin UI or migrations
2. Seed chart_data collection with sample data
3. Implement service layer and utilities
4. Build chart components
5. Build counter route page
6. Add navigation link to counter route
7. Test and refine

## Inspiration Mapping

Phoenix LiveView Pattern → SvelteKit Pattern:
- `LiveView.mount/3` → `+page.ts load()`
- `handle_event/3` → Component event handlers + service calls
- `assign/3` → Svelte reactive state (`$state()`)
- LiveSvelte `props` → Svelte component `$props()`
- Server push → Client-side state updates
- Ecto queries → PocketBase SDK queries
