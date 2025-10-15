# Proposal: Implement Counter with Charts

## Overview
Add a new `/counter` route that implements a database-backed counter with 10 interactive charts powered by uPlot. The implementation draws inspiration from the LiveSvelte counter pattern seen in the Phoenix LiveView reference application, adapted for SvelteKit + PocketBase architecture.

## Motivation
- Demonstrate full-stack integration between SvelteKit frontend and PocketBase backend
- Showcase real-time data visualization capabilities using uPlot charting library
- Provide a reference implementation for database-backed interactive features
- Create reusable patterns for counter state management and chart rendering

## Scope

### In Scope
- New `/counter` route with dedicated page component
- PocketBase collection for counter state persistence
- PocketBase collection for chart data (quarterly/time-series values)
- 10 distinct chart visualizations using uPlot library
- Database seeding for chart demonstration data
- Reactive counter increment/decrement with database sync
- Chart components with real-time data updates

### Out of Scope
- Authentication/authorization for counter operations
- Multi-user counter synchronization
- Chart data export functionality
- Historical counter value tracking
- WebSocket/real-time subscriptions (initial implementation uses polling/manual refresh)

## Success Criteria
- Counter persists state across page refreshes via PocketBase
- All 10 charts render correctly with seeded data
- Charts update reactively when data changes
- Counter operations (increment/decrement) update database successfully
- Implementation follows SvelteKit 5 and Svelte runes patterns
- Code is well-documented with clear separation of concerns

## Dependencies
- uPlot charting library (npm package)
- PocketBase collections for `counters` and `chart_data`
- SvelteKit 5 with Svelte runes support
- Existing PocketBase SDK integration

## Risks & Mitigations
- **Risk**: uPlot bundle size impact on frontend performance
  - *Mitigation*: Import only necessary uPlot modules, lazy-load chart components
- **Risk**: Chart rendering performance with large datasets
  - *Mitigation*: Limit data points per chart, implement pagination if needed
- **Risk**: PocketBase collection schema changes breaking existing data
  - *Mitigation*: Use migrations, version collection schemas appropriately
