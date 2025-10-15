# SvelteKit Service Specification

## ADDED Requirements

### Requirement: Bun-Based Container Image
The system SHALL provide a Docker image for SvelteKit frontend using official Bun runtime image as base.

#### Scenario: Bun base image
- **WHEN** frontend image is built
- **THEN** it uses `oven/bun:latest` or pinned version (e.g., `oven/bun:1.1`)
- **AND** Bun runtime is available at `/usr/local/bin/bun`
- **AND** image includes all Bun tools (package manager, test runner)

#### Scenario: Dependency installation
- **WHEN** image build runs
- **THEN** `package.json` and `bun.lockb` are copied first (layer caching)
- **AND** `bun install` runs to install dependencies
- **AND** installed packages are in `/app/node_modules`
- **AND** lockfile ensures reproducible installs

#### Scenario: Source code copying
- **WHEN** image build continues
- **THEN** source code is copied to `/app`
- **AND** this layer rebuilds when source changes
- **AND** previous layers (dependencies) are cached

### Requirement: SvelteKit Project Configuration
The system SHALL configure SvelteKit with Svelte 5, TypeScript, SPA adapter, and proper development settings.

#### Scenario: Svelte 5 with runes enabled
- **WHEN** frontend project is initialized
- **THEN** `package.json` includes `svelte@^5.0.0`
- **AND** `svelte.config.js` is configured for Svelte 5
- **AND** runes are enabled (default in Svelte 5)
- **AND** example components use runes syntax (`$state`, `$derived`, `$effect`)

#### Scenario: SPA adapter configuration
- **WHEN** `svelte.config.js` is examined
- **THEN** adapter is `@sveltejs/adapter-static`
- **AND** fallback is set to `index.html` for client-side routing
- **AND** prerender is disabled or set to `false`
- **AND** ssr is set to `false` in config

#### Scenario: TypeScript support
- **WHEN** project is initialized
- **THEN** `tsconfig.json` exists with proper Svelte types
- **AND** `.ts` and `.svelte` files have type checking
- **AND** Vite handles TypeScript compilation
- **AND** Bun's native TypeScript support is used

### Requirement: Development Server Configuration
The system SHALL run Vite development server with hot module replacement (HMR) accessible from host machine.

#### Scenario: Dev server startup
- **WHEN** frontend container starts
- **THEN** command is `bun run dev --host 0.0.0.0`
- **AND** server listens on all interfaces
- **AND** port 5173 is exposed and mapped to host
- **AND** server starts within 5 seconds

#### Scenario: Hot module replacement
- **WHEN** developer modifies source file
- **AND** saves the file
- **THEN** Vite detects change via file watcher
- **AND** HMR update is sent to browser
- **AND** module is replaced without full page reload
- **AND** update happens within 1 second

#### Scenario: WebSocket connection
- **WHEN** browser connects to dev server
- **THEN** WebSocket connection is established for HMR
- **AND** connection URL is `ws://localhost:5173`
- **AND** connection remains stable during development
- **AND** reconnects automatically if interrupted

### Requirement: Source Code Volume Mounting
The system SHALL mount source code directory to enable hot-reload without rebuilding container.

#### Scenario: Source directory bind mount
- **WHEN** frontend container starts
- **THEN** local `src/` directory is mounted to `/app/src` in container
- **AND** file changes on host are immediately visible in container
- **AND** Vite watches mounted files
- **AND** no manual file sync is required

#### Scenario: Node modules isolation
- **WHEN** source is mounted
- **THEN** anonymous volume is mounted at `/app/node_modules`
- **AND** container's installed packages are preserved
- **AND** host's node_modules (if exists) does not interfere
- **AND** file system performance is optimal

#### Scenario: Build output isolation
- **WHEN** Vite generates `.svelte-kit` directory
- **THEN** it's created in container, not on host (optional)
- **AND** or it's shared via bind mount for inspection
- **AND** build artifacts don't pollute host filesystem

### Requirement: PocketBase SDK Integration
The system SHALL install and configure PocketBase JavaScript SDK for API communication.

#### Scenario: SDK installation
- **WHEN** `bun install` runs
- **THEN** `pocketbase` package is installed from npm
- **AND** SDK is available for import in code
- **AND** TypeScript types are included

#### Scenario: PocketBase client initialization
- **WHEN** application code imports PocketBase
- **THEN** client is initialized with `VITE_POCKETBASE_URL` environment variable
- **AND** URL points to `http://localhost:8090` for browser requests
- **AND** client can perform authentication, CRUD, real-time subscriptions

#### Scenario: API communication
- **WHEN** frontend makes API request to PocketBase
- **THEN** request goes to `http://localhost:8090/api/...`
- **AND** CORS headers allow the request
- **AND** response is received successfully
- **AND** auth tokens are stored in localStorage

### Requirement: Environment Variable Configuration
The system SHALL provide environment variables for configuring PocketBase URL and other settings.

#### Scenario: Vite environment variables
- **WHEN** frontend container starts
- **THEN** `VITE_POCKETBASE_URL` is set from `.env` file
- **AND** value is `http://localhost:8090` for browser access
- **AND** variable is accessible in code as `import.meta.env.VITE_POCKETBASE_URL`

#### Scenario: Public environment variables
- **WHEN** build runs
- **THEN** only variables prefixed with `VITE_` are exposed to browser
- **AND** sensitive variables remain server-side only
- **AND** variables are replaced at build time

### Requirement: Svelte 5 Runes Demonstration
The system SHALL provide example components demonstrating Svelte 5 runes for reactivity.

#### Scenario: State rune example
- **WHEN** example component uses `$state`
- **THEN** reactive variable is declared as `let count = $state(0)`
- **AND** variable updates trigger re-renders
- **AND** state persists within component lifecycle

#### Scenario: Derived rune example
- **WHEN** example component uses `$derived`
- **THEN** computed value is declared as `let doubled = $derived(count * 2)`
- **AND** value automatically updates when dependencies change
- **AND** computation is memoized

#### Scenario: Effect rune example
- **WHEN** example component uses `$effect`
- **THEN** side effect runs as `$effect(() => { console.log(count) })`
- **AND** effect runs when dependencies change
- **AND** cleanup function is supported with `return () => { ... }`

#### Scenario: Runes in TypeScript
- **WHEN** runes are used in `.ts` or `.svelte` files
- **THEN** TypeScript correctly infers types
- **AND** no manual type annotations required
- **AND** IDE autocomplete works correctly

### Requirement: Service Dependencies
The system SHALL configure frontend service to depend on PocketBase being healthy before starting.

#### Scenario: Startup dependency
- **WHEN** `docker compose up` runs
- **THEN** frontend waits for PocketBase health check to pass
- **AND** frontend only starts after PocketBase is healthy
- **AND** startup order is predictable

#### Scenario: Connection validation
- **WHEN** frontend starts
- **AND** attempts to connect to PocketBase
- **THEN** PocketBase is guaranteed to be accepting requests
- **AND** no "connection refused" errors occur
- **AND** initial API calls succeed

### Requirement: Logging and Debugging
The system SHALL provide access to frontend logs and support debugging tools.

#### Scenario: Container logs
- **WHEN** frontend is running
- **AND** developer runs `docker compose logs frontend`
- **THEN** Vite startup messages are visible
- **AND** HMR update notifications are visible
- **AND** console.log output from code is visible
- **AND** error stack traces are visible

#### Scenario: Browser DevTools
- **WHEN** application runs in browser
- **THEN** source maps are generated for debugging
- **AND** original TypeScript/Svelte source is visible in DevTools
- **AND** breakpoints can be set in original source
- **AND** stack traces reference original files

#### Scenario: Vite error overlay
- **WHEN** compilation error occurs
- **THEN** Vite displays error overlay in browser
- **AND** error message includes file and line number
- **AND** overlay disappears when error is fixed
- **AND** HMR reconnects automatically
