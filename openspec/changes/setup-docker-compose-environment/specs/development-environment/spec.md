# Development Environment Specification

## ADDED Requirements

### Requirement: Docker Compose Orchestration
The system SHALL provide a Docker Compose configuration that orchestrates all required services for local development with a single command.

#### Scenario: Start development environment
- **WHEN** developer runs `docker compose up`
- **THEN** all services (PocketBase, SvelteKit) start successfully
- **AND** services can communicate with each other
- **AND** logs from all services are visible in terminal

#### Scenario: Stop development environment
- **WHEN** developer runs `docker compose down`
- **THEN** all services stop gracefully
- **AND** PocketBase data is preserved in named volume
- **AND** no orphaned containers remain

#### Scenario: Reset development environment
- **WHEN** developer runs `docker compose down -v && docker compose up`
- **THEN** all volumes are removed
- **AND** services start with clean state
- **AND** PocketBase requires initial admin setup

### Requirement: One-Command Setup
The system SHALL allow developers to start the full development environment without installing runtimes or dependencies on their host machine.

#### Scenario: First-time setup
- **WHEN** new developer clones repository
- **AND** copies `.env.example` to `.env`
- **AND** runs `docker compose up`
- **THEN** all images build successfully
- **AND** all services start and become healthy
- **AND** developer can access applications via browser

#### Scenario: Quick startup after initial setup
- **WHEN** developer with existing images runs `docker compose up`
- **THEN** services start within 10 seconds
- **AND** no rebuild is required unless code changes affect Docker layers

### Requirement: Development Workflow Support
The system SHALL support rapid development iteration with hot-reload capabilities for both frontend and backend changes.

#### Scenario: Frontend code hot-reload
- **WHEN** developer modifies a Svelte component
- **AND** saves the file
- **THEN** Vite detects the change
- **AND** browser hot-reloads the component without full page refresh
- **AND** application state is preserved where possible

#### Scenario: Frontend configuration changes
- **WHEN** developer modifies `svelte.config.js` or `vite.config.ts`
- **THEN** Vite dev server restarts automatically
- **AND** changes take effect within 5 seconds

#### Scenario: PocketBase schema changes
- **WHEN** developer modifies collections via admin UI
- **THEN** changes persist in `pb_data` volume
- **AND** changes are available immediately to frontend
- **AND** changes survive container restarts

### Requirement: Environment Configuration
The system SHALL manage environment variables through `.env` file with sensible defaults and clear documentation.

#### Scenario: Default configuration works
- **WHEN** developer copies `.env.example` to `.env` without modifications
- **THEN** all services start successfully
- **AND** frontend can connect to PocketBase
- **AND** no manual configuration is required

#### Scenario: Custom configuration
- **WHEN** developer modifies variables in `.env`
- **AND** restarts services with `docker compose up`
- **THEN** new values are used by containers
- **AND** services reflect the configuration changes

### Requirement: Service Health Monitoring
The system SHALL provide health checks to verify services are ready to accept requests.

#### Scenario: PocketBase health check
- **WHEN** PocketBase container starts
- **THEN** Docker monitors health endpoint `/_/`
- **AND** service is marked healthy when endpoint responds 200
- **AND** dependent services wait for healthy status before starting

#### Scenario: Startup dependency ordering
- **WHEN** `docker compose up` runs
- **THEN** PocketBase starts first
- **AND** frontend waits for PocketBase to be healthy
- **AND** frontend starts only after PocketBase is ready

### Requirement: Data Persistence
The system SHALL persist PocketBase data across container lifecycles using named Docker volumes.

#### Scenario: Data survives container restart
- **WHEN** developer creates PocketBase collections and records
- **AND** stops containers with `docker compose down`
- **AND** starts containers again with `docker compose up`
- **THEN** all collections and records are preserved
- **AND** no data is lost

#### Scenario: Data survives image rebuild
- **WHEN** developer has existing PocketBase data
- **AND** rebuilds PocketBase image with `docker compose build pocketbase`
- **AND** starts services
- **THEN** existing data is preserved
- **AND** new image uses the same volume

### Requirement: Development Tools Isolation
The system SHALL isolate all development tools and runtimes within containers, requiring only Docker on the host machine.

#### Scenario: No local runtime installation
- **WHEN** developer sets up project
- **THEN** Bun runtime is only installed in container
- **AND** PocketBase executable is only in container
- **AND** Node.js is not required on host machine
- **AND** only Docker Engine/Desktop is required on host

#### Scenario: Consistent versions across team
- **WHEN** multiple developers work on project
- **THEN** all use same Bun version (from Dockerfile)
- **AND** all use same PocketBase version (from Dockerfile)
- **AND** all use same Node package versions (from lockfile)
- **AND** "works on my machine" issues are eliminated
