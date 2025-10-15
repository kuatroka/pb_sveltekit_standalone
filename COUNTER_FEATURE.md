# Counter with Charts Feature

## Overview

The Counter feature is a comprehensive demonstration of full-stack integration between SvelteKit (frontend) and PocketBase (backend), featuring:

- **Database-backed counter** with atomic increment/decrement operations
- **10 interactive chart visualizations** using the uPlot library
- **Reactive UI** using Svelte 5 runes for state management
- **Optimistic updates** for instant UI feedback
- **Error handling** with automatic rollback on failures

## Architecture

### Frontend Stack
- **SvelteKit 5**: Client-side SPA routing and page management
- **Svelte 5 Runes**: Modern reactive state management (`$state`, `$props`)
- **uPlot**: High-performance charting library
- **Tailwind CSS + DaisyUI**: Styling and UI components
- **TypeScript**: Type-safe development

### Backend Stack
- **PocketBase**: Backend-as-a-service with SQLite database
- **SQLite**: Embedded database for data persistence
- **REST API**: PocketBase auto-generated endpoints

## File Structure

```
frontend/src/
├── lib/
│   ├── components/
│   │   └── QuarterChart.svelte          # Reusable chart component
│   ├── services/
│   │   ├── counterService.ts            # Counter API operations
│   │   └── chartDataService.ts          # Chart data API operations
│   └── utils/
│       └── chartFactory.ts              # Chart configurations (10 types)
├── routes/
│   ├── counter/
│   │   ├── components/
│   │   │   ├── CounterControls.svelte   # Counter UI with buttons
│   │   │   └── ChartGrid.svelte         # Grid layout for all charts
│   │   ├── +page.svelte                 # Main counter page
│   │   └── +page.ts                     # Data loader
│   └── +layout.svelte                   # Updated with navigation
```

## Database Schema

### counters Collection
```
id       : text (primary, manual) - "main"
value    : number (required, default: 0)
updated  : date (auto-update)
```

### chart_data Collection
```
id       : auto-generated
quarter  : text (unique, required) - Format: "Q1 2024"
value    : number (required)
created  : date (auto-create)
updated  : date (auto-update)
```

## Chart Types

The feature includes 10 distinct chart visualizations of the same quarterly dataset:

1. **Bars** - Column chart showing raw values
2. **Line** - Simple line connecting data points
3. **Area** - Line chart with filled area
4. **Scatter** - Points-only distribution
5. **Step** - Stepped line showing discrete changes
6. **Spline** - Smooth curve interpolation
7. **Cumulative** - Running total overlay
8. **Moving Average** - 3-quarter smoothed trend
9. **Range** - Confidence envelope (±5 units)
10. **Delta** - Quarter-over-quarter diverging bars

Each chart type is configured in `chartFactory.ts` with:
- Custom visual styling (colors, stroke widths, fills)
- Data transformations (cumulative, moving average, deltas)
- uPlot-specific rendering options

## Key Features

### Optimistic Updates
- Counter updates immediately in UI
- Database sync happens in background
- Automatic rollback if operation fails

### Error Handling
- Try-catch blocks around all async operations
- User-friendly error messages
- Console logging for debugging

### Performance
- Parallel data fetching (counter + charts)
- Debounced window resize handlers
- Chart reuse (update data without re-creating)

### Accessibility
- ARIA labels on interactive elements
- Keyboard navigation support
- Semantic HTML structure

## Setup Instructions

### 1. Install Dependencies

The dependencies are already installed:
- uPlot (v1.6.32)
- PocketBase SDK (v0.21.0)

### 2. Configure PocketBase

Follow the instructions in `POCKETBASE_SETUP.md` to:
1. Create `counters` collection
2. Create `chart_data` collection
3. Seed initial data

### 3. Run the Application

```bash
# Start PocketBase (in project root)
docker compose up

# Frontend runs on: http://localhost:5173
# PocketBase admin: http://localhost:8090/_/
```

### 4. Access the Counter

Navigate to `http://localhost:5173/counter` to see:
- Counter controls (increment/decrement)
- Primary bar chart
- Grid of 9 additional chart types

## Usage Examples

### Using Counter Service

```typescript
import * as counterService from '$lib/services/counterService';

// Get current value
const value = await counterService.getValue();

// Increment
const newValue = await counterService.increment();

// Decrement
const decrementedValue = await counterService.decrement();
```

### Using Chart Data Service

```typescript
import * as chartDataService from '$lib/services/chartDataService';

// Get chart data
const series = await chartDataService.getChartSeries();
// Returns: { labels: ['Q1 2023', ...], values: [42, ...] }

// Refresh data
const freshData = await chartDataService.refreshChartData();
```

### Creating Custom Charts

```typescript
import { createQuarterChart } from '$lib/utils/chartFactory';

const chart = createQuarterChart(
  containerElement,
  ['Q1', 'Q2', 'Q3', 'Q4'],
  [42, 58, 51, 73],
  'My Custom Chart',
  'line'  // Chart type
);
```

## Testing

### Manual Testing Checklist
- [ ] Counter increments correctly
- [ ] Counter decrements correctly
- [ ] Value persists across page refreshes
- [ ] All 10 charts render without errors
- [ ] Charts resize on window resize
- [ ] Error messages display on network failure
- [ ] Navigation works between home and counter
- [ ] Optimistic updates feel instant
- [ ] Loading states prevent double-clicks

### Browser Compatibility
- Chrome/Edge (recommended)
- Firefox
- Safari

## Performance Considerations

- **Chart Rendering**: Charts created once in `onMount`, then updated via `setData`
- **Data Fetching**: Counter and chart data loaded in parallel
- **Resize Handling**: Debounced (150ms) to avoid excessive re-renders
- **Bundle Size**: uPlot is ~40KB minified + gzipped

## Future Enhancements

Potential improvements (out of current scope):
- Real-time updates via PocketBase subscriptions
- Chart data export (CSV, JSON)
- Historical counter value tracking
- Multi-user counter synchronization
- Authentication-based access control
- Chart customization UI (colors, ranges)
- More chart types (heatmaps, gauges, etc.)

## Troubleshooting

### Charts not rendering
- Check browser console for errors
- Verify uPlot CSS is imported
- Ensure chart data has valid values

### Counter not persisting
- Check PocketBase is running
- Verify collections exist in admin UI
- Check network tab for API errors

### TypeScript errors
- Run `bun install` to ensure types are available
- Check for missing @types packages

## Inspiration

This implementation is adapted from the Phoenix LiveView + LiveSvelte reference application, translating server-side patterns to client-side SvelteKit architecture while maintaining similar UX and functionality.

## License

Part of the PocketBase + SvelteKit demo application.
