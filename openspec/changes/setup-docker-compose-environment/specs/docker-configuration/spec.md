# Docker Configuration Specification

## ADDED Requirements

### Requirement: Docker Compose File Structure
The system SHALL provide a `docker-compose.yml` file that defines all services, networks, volumes, and configurations in YAML format following Docker Compose specification v3.8+.

#### Scenario: Valid compose file
- **WHEN** developer runs `docker compose config`
- **THEN** YAML is valid and parseable
- **AND** all service definitions are correct
- **AND** no syntax errors are reported

#### Scenario: Service definitions
- **WHEN** compose file is parsed
- **THEN** exactly two services are defined: `pocketbase` and `frontend`
- **AND** each service has required properties (build/image, ports, volumes)
- **AND** services are connected via default network

### Requirement: Build Context Configuration
The system SHALL define appropriate build contexts and Dockerfiles for each service with optimized layer caching.

#### Scenario: PocketBase build context
- **WHEN** PocketBase service is built
- **THEN** build context is `./pocketbase` directory
- **AND** Dockerfile is located at `./pocketbase/Dockerfile`
- **AND** `.dockerignore` excludes `pb_data` from build context

#### Scenario: Frontend build context
- **WHEN** frontend service is built
- **THEN** build context is `./frontend` directory (or project root if frontend is in root)
- **AND** Dockerfile is located appropriately
- **AND** `.dockerignore` excludes `node_modules`, `.svelte-kit`, `build` directories

#### Scenario: Build caching optimization
- **WHEN** developer rebuilds images
- **THEN** unchanged layers are cached
- **AND** dependency installation layer is cached when lockfile unchanged
- **AND** only source code layers rebuild when code changes

### Requirement: Port Mapping Configuration
The system SHALL expose service ports to the host machine for browser and tool access.

#### Scenario: PocketBase port exposure
- **WHEN** services are running
- **THEN** PocketBase is accessible at `http://localhost:8090`
- **AND** admin UI is accessible at `http://localhost:8090/_/`
- **AND** API is accessible at `http://localhost:8090/api/`

#### Scenario: Frontend port exposure
- **WHEN** services are running
- **THEN** SvelteKit dev server is accessible at `http://localhost:5173`
- **AND** Vite HMR websocket connects successfully
- **AND** application loads in browser

#### Scenario: No port conflicts
- **WHEN** `docker compose up` runs
- **THEN** if ports are already in use, error message indicates port conflict
- **AND** user can modify ports in docker-compose.yml
- **AND** alternative ports work without code changes

### Requirement: Volume Mount Configuration
The system SHALL configure appropriate volume mounts for data persistence and hot-reload functionality.

#### Scenario: PocketBase data volume
- **WHEN** PocketBase service starts
- **THEN** named volume `pb_data` is mounted to `/pb_data` in container
- **AND** PocketBase is configured to use this directory
- **AND** volume persists after `docker compose down`
- **AND** volume is only removed with `docker compose down -v`

#### Scenario: Frontend source code mount
- **WHEN** frontend service starts
- **THEN** source code directory is bind-mounted to `/app` in container
- **AND** file changes on host are immediately visible in container
- **AND** Vite watches mounted files for changes

#### Scenario: Frontend node_modules isolation
- **WHEN** frontend service starts
- **THEN** anonymous volume is mounted to `/app/node_modules`
- **AND** host's node_modules (if exists) is ignored
- **AND** container uses its own installed dependencies
- **AND** performance is not degraded by bind mount

### Requirement: Network Configuration
The system SHALL create a Docker network that allows services to communicate using service names as hostnames.

#### Scenario: Service discovery
- **WHEN** frontend needs to connect to PocketBase
- **THEN** hostname `pocketbase` resolves to PocketBase container IP
- **AND** internal port 8090 is accessible without host port mapping
- **AND** DNS resolution is automatic via Docker

#### Scenario: Internal vs external access
- **WHEN** frontend container makes request to PocketBase
- **THEN** request goes to `http://pocketbase:8090` (internal)
- **AND** browser makes request to `http://localhost:8090` (external via port mapping)
- **AND** environment variables handle this difference correctly

### Requirement: Environment Variable Management
The system SHALL support `.env` file for configuring service environment variables with template provided.

#### Scenario: Environment template
- **WHEN** repository is cloned
- **THEN** `.env.example` file exists in root
- **AND** file documents all required variables
- **AND** file includes sensible default values
- **AND** file includes comments explaining each variable

#### Scenario: Environment loading
- **WHEN** `.env` file exists in root
- **AND** `docker compose up` runs
- **THEN** variables are loaded automatically
- **AND** variables are available to services via `environment` key
- **AND** variables can be accessed in containers

#### Scenario: Required variables
- **GIVEN** `.env` file defines `VITE_POCKETBASE_URL=http://localhost:8090`
- **WHEN** frontend container starts
- **THEN** variable is available as `process.env.VITE_POCKETBASE_URL`
- **AND** Vite exposes it to client code
- **AND** PocketBase SDK uses this URL for API calls

### Requirement: Service Dependencies
The system SHALL configure service startup order to ensure dependencies are ready before dependent services start.

#### Scenario: Startup order
- **WHEN** `docker compose up` runs
- **THEN** PocketBase starts first
- **AND** frontend waits via `depends_on` with `service_healthy` condition
- **AND** frontend only starts after PocketBase health check passes

#### Scenario: Restart behavior
- **WHEN** PocketBase crashes or exits
- **AND** restart policy is `unless-stopped`
- **THEN** PocketBase automatically restarts
- **AND** frontend reconnects automatically when PocketBase is healthy

### Requirement: Dockerignore Configuration
The system SHALL provide `.dockerignore` files to exclude unnecessary files from build context, improving build performance and security.

#### Scenario: Common exclusions
- **WHEN** any service image is built
- **THEN** `.git` directory is excluded
- **AND** `.env` file is excluded (secrets)
- **AND** `node_modules` is excluded (rebuilt in container)
- **AND** local build artifacts are excluded

#### Scenario: PocketBase specific exclusions
- **WHEN** PocketBase image is built
- **THEN** `pb_data` directory is excluded
- **AND** only Dockerfile is included in build context

#### Scenario: Frontend specific exclusions
- **WHEN** frontend image is built
- **THEN** `.svelte-kit` directory is excluded
- **AND** `build` directory is excluded
- **AND** test files are excluded (optional, for production builds)
