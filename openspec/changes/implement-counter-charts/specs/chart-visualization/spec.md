# Spec: Chart Visualization

## ADDED Requirements

### Requirement: Chart Data Collection
The system MUST persist chart data in a PocketBase collection that can be queried and displayed in multiple visualization formats.

#### Scenario: Chart data collection exists
**Given** PocketBase is initialized
**When** checking for the `chart_data` collection
**Then** the collection exists with the following fields:
- `id` (auto-generated)
- `quarter` (text, unique, e.g., "Q1 2024")
- `value` (number, required)
- `created` (date, auto-created)
- `updated` (date, auto-updated)

#### Scenario: Query all chart data ordered by quarter
**Given** the `chart_data` collection contains multiple records
**When** fetching chart data for visualization
**Then** all records are returned ordered chronologically by quarter
**And** the data is formatted as `{labels: string[], values: number[]}`

#### Scenario: Seed chart data on initialization
**Given** the `chart_data` collection is empty
**When** the application initializes
**Then** sample quarterly data is seeded (at least 8 quarters)
**And** values vary realistically (e.g., between 20-100)

### Requirement: uPlot Chart Library Integration
The frontend MUST integrate the uPlot library for high-performance chart rendering.

#### Scenario: uPlot package is installed
**Given** the project dependencies
**When** checking package.json
**Then** `uplot` is listed as a dependency
**And** the uPlot CSS is imported in the chart components

#### Scenario: Chart factory creates chart configuration
**Given** the chartFactory utility module
**When** `createChartConfig('bars', labels, values)` is called
**Then** a valid uPlot options object is returned
**And** the configuration includes title, dimensions, series, and axes

### Requirement: Ten Distinct Chart Types
The system MUST render exactly 10 different chart visualizations of the same dataset, each highlighting different aspects of the data.

#### Scenario: Bars chart renders column visualization
**Given** chart data is loaded
**When** the bars chart is rendered
**Then** a column/bar chart is displayed using uPlot
**And** each bar represents a quarterly value

#### Scenario: Line chart renders trend visualization
**Given** chart data is loaded
**When** the line chart is rendered
**Then** a line chart is displayed connecting data points
**And** points are visible at each data value

#### Scenario: Area chart renders filled visualization
**Given** chart data is loaded
**When** the area chart is rendered
**Then** a line chart with filled area beneath is displayed
**And** the fill emphasizes magnitude

#### Scenario: Scatter chart renders point distribution
**Given** chart data is loaded
**When** the scatter chart is rendered
**Then** individual points are displayed without connecting lines
**And** point size is consistent and visible

#### Scenario: Step chart renders discrete changes
**Given** chart data is loaded
**When** the step chart is rendered
**Then** a step chart with horizontal plateaus is displayed
**And** steps align with quarter boundaries

#### Scenario: Spline chart renders smooth interpolation
**Given** chart data is loaded
**When** the spline chart is rendered
**Then** a smoothly curved line interpolates through data points
**And** the curve is visually distinct from linear interpolation

#### Scenario: Cumulative chart shows running total
**Given** chart data is loaded
**When** the cumulative chart is rendered
**Then** two series are displayed: raw values and cumulative sum
**And** the cumulative line trends upward (assuming positive values)

#### Scenario: Moving average chart smooths volatility
**Given** chart data is loaded
**When** the moving average chart is rendered
**Then** two series are displayed: raw values and 3-quarter moving average
**And** the moving average line is smoother than raw values

#### Scenario: Range chart displays confidence envelope
**Given** chart data is loaded
**When** the range chart is rendered
**Then** a shaded band ±5 units around actual values is displayed
**And** the actual value line runs through the middle of the band

#### Scenario: Delta chart shows quarter-over-quarter changes
**Given** chart data is loaded
**When** the delta chart is rendered
**Then** diverging bars show positive gains and negative losses
**And** gains are colored green and losses are colored red
**And** the first quarter has no bar (no prior quarter to compare)

### Requirement: Reusable Chart Component
A single QuarterChart component MUST handle all chart types through configuration.

#### Scenario: Chart component accepts type configuration
**Given** the QuarterChart component
**When** rendered with `<QuarterChart chartKey="bars" series={data} />`
**Then** the bars chart type is rendered
**And** changing chartKey to "line" renders a line chart instead

#### Scenario: Chart component handles data updates
**Given** a QuarterChart is mounted with initial data
**When** the series prop updates with new values
**Then** the chart updates to display the new data
**And** the update is animated/smooth (not a full re-render)

#### Scenario: Chart component responds to window resize
**Given** a QuarterChart is rendered
**When** the browser window is resized
**Then** the chart dimensions update to fit the container
**And** the aspect ratio is maintained

#### Scenario: Chart component cleans up on unmount
**Given** a QuarterChart is mounted
**When** the component is unmounted/destroyed
**Then** the uPlot instance is destroyed
**And** event listeners are removed
**And** no memory leaks occur

### Requirement: Chart Display Layout
Charts MUST be organized in a responsive grid layout that adapts to screen size.

#### Scenario: Primary chart displays prominently
**Given** the counter page is rendered
**When** viewing charts
**Then** the bars chart is displayed full-width at the top
**And** it is labeled as the primary visualization

#### Scenario: Additional charts display in grid
**Given** the counter page is rendered
**When** viewing charts
**Then** the remaining 9 charts are displayed in a grid below
**And** the grid shows 1 column on mobile, 2 on tablet, 3 on desktop
**And** each chart has a title and description

#### Scenario: Charts load without blocking page render
**Given** the counter page is loading
**When** charts are being initialized
**Then** the page remains interactive
**And** charts render progressively without blocking the UI thread

## Cross-references
- Related to **Counter Backend** (counter-backend): Charts are displayed on the same page as the counter
- Related to **Chart Data Seeding** (implied): Chart data must be seeded before charts can render
