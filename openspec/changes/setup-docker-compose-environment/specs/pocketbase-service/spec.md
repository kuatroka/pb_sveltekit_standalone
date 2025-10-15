# PocketBase Service Specification

## ADDED Requirements

### Requirement: PocketBase Container Image
The system SHALL provide a custom Docker image for PocketBase based on Alpine Linux with the PocketBase executable downloaded and installed.

#### Scenario: Alpine base image
- **WHEN** PocketBase image is built
- **THEN** it uses `alpine:latest` as base image
- **AND** image size is minimal (under 50MB)
- **AND** all required system dependencies are installed (ca-certificates, wget, unzip)

#### Scenario: PocketBase installation
- **WHEN** image build runs
- **THEN** PocketBase binary is downloaded from official GitHub releases
- **AND** version is pinned via build argument `PB_VERSION`
- **AND** binary is extracted and placed in working directory
- **AND** binary is made executable with `chmod +x`

#### Scenario: Configurable PocketBase version
- **WHEN** developer wants specific PocketBase version
- **THEN** version can be changed via `ARG PB_VERSION=X.Y.Z` in Dockerfile
- **AND** image rebuilds with new version
- **AND** no other changes required

### Requirement: PocketBase Server Configuration
The system SHALL configure PocketBase to serve on all network interfaces and persist data to mounted volume.

#### Scenario: Server startup command
- **WHEN** PocketBase container starts
- **THEN** command is `./pocketbase serve --http=0.0.0.0:8090`
- **AND** server listens on all interfaces (0.0.0.0)
- **AND** server uses port 8090 (PocketBase standard)

#### Scenario: Data directory configuration
- **WHEN** PocketBase starts
- **THEN** data directory is automatically `/pb_data` (PocketBase default)
- **AND** this directory is mounted as volume
- **AND** SQLite database is stored in volume
- **AND** uploaded files are stored in volume

#### Scenario: Admin UI access
- **WHEN** PocketBase is running
- **AND** developer navigates to `http://localhost:8090/_/`
- **THEN** admin UI loads successfully
- **AND** initial setup wizard appears on first run
- **AND** existing admin session persists after restart

### Requirement: Health Check Configuration
The system SHALL implement health checks to verify PocketBase is ready to serve requests.

#### Scenario: Health check endpoint
- **WHEN** PocketBase container is running
- **THEN** Docker performs HTTP GET to `http://localhost:8090/_/`
- **AND** check interval is 10 seconds
- **AND** timeout is 3 seconds
- **AND** 3 consecutive failures mark service unhealthy

#### Scenario: Startup health
- **WHEN** container starts
- **THEN** health status is initially "starting"
- **AND** status changes to "healthy" when endpoint responds 200
- **AND** dependent services receive notification

#### Scenario: Health check failure
- **WHEN** PocketBase crashes or stops responding
- **THEN** health status changes to "unhealthy"
- **AND** container may restart based on restart policy
- **AND** frontend receives connection errors

### Requirement: Data Persistence
The system SHALL persist all PocketBase data using Docker named volumes that survive container lifecycle events.

#### Scenario: Volume creation
- **WHEN** `docker compose up` runs for first time
- **THEN** named volume `pb_data` is created
- **AND** volume is mounted to `/pb_data` in container
- **AND** PocketBase initializes database in this location

#### Scenario: Data survival after stop
- **WHEN** developer stops containers with `docker compose down`
- **AND** restarts with `docker compose up`
- **THEN** volume still exists
- **AND** all data is intact (users, collections, records, files)
- **AND** no data is lost

#### Scenario: Volume inspection
- **WHEN** developer runs `docker volume ls`
- **THEN** volume is listed with name matching project prefix
- **AND** developer can inspect with `docker volume inspect <name>`
- **AND** developer can back up volume contents if needed

#### Scenario: Clean slate reset
- **WHEN** developer runs `docker compose down -v`
- **THEN** volume is deleted
- **AND** next startup requires initial PocketBase setup
- **AND** all data is gone (as intended for reset)

### Requirement: CORS Configuration
The system SHALL configure PocketBase to allow cross-origin requests from the frontend development server.

#### Scenario: Default CORS allows localhost
- **WHEN** frontend at `http://localhost:5173` makes API request
- **THEN** PocketBase returns proper CORS headers
- **AND** request is not blocked by browser
- **AND** credentials/cookies can be sent

#### Scenario: CORS for Docker network
- **WHEN** frontend container makes request to `http://pocketbase:8090`
- **THEN** request succeeds (same Docker network, CORS not enforced)
- **AND** internal container-to-container communication works

### Requirement: Migration Support (Optional)
The system SHALL support mounting PocketBase migrations directory for schema versioning when the directory exists.

#### Scenario: Migrations directory mount
- **WHEN** `pb_migrations` directory exists in project
- **AND** volume is mounted to `/pb_migrations` in container
- **THEN** PocketBase detects and runs migrations on startup
- **AND** schema changes are applied automatically

#### Scenario: No migrations directory
- **WHEN** `pb_migrations` directory does not exist
- **THEN** PocketBase starts normally without migrations
- **AND** schema is managed via admin UI
- **AND** no errors occur

### Requirement: Logging Configuration
The system SHALL provide access to PocketBase logs for debugging and monitoring.

#### Scenario: Container logs
- **WHEN** PocketBase is running
- **AND** developer runs `docker compose logs pocketbase`
- **THEN** PocketBase startup messages are visible
- **AND** API request logs are visible
- **AND** error messages are visible
- **AND** logs can be followed with `-f` flag

#### Scenario: Log persistence
- **WHEN** container restarts
- **THEN** previous logs are cleared (ephemeral)
- **AND** new logs start from container startup
- **AND** important data is in database (volume), not logs
