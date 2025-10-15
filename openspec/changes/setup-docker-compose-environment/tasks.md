# Implementation Tasks

## 1. Docker Configuration Files
- [x] 1.1 Create `.dockerignore` file to exclude unnecessary files from build context
- [x] 1.2 Create `docker-compose.yml` with service definitions for PocketBase and SvelteKit
- [x] 1.3 Create `.env.example` template with required environment variables
- [x] 1.4 Add Docker-related files to `.gitignore` if not already present

## 2. PocketBase Service Setup
- [x] 2.1 Create `pocketbase/Dockerfile` with Alpine Linux base image
- [x] 2.2 Download and install PocketBase executable in container
- [x] 2.3 Configure volume mount for `pb_data` directory persistence
- [x] 2.4 Configure volume mount for `pb_migrations` directory (optional)
- [x] 2.5 Expose PocketBase port (8090) for admin UI and API access
- [x] 2.6 Set up health check for PocketBase service

## 3. SvelteKit Service Setup
- [x] 3.1 Create `frontend/Dockerfile` with Bun base image
- [x] 3.2 Initialize SvelteKit project with Svelte 5 and TypeScript
- [x] 3.3 Configure SvelteKit for SPA mode with `@sveltejs/adapter-static`
- [x] 3.4 Install PocketBase JavaScript SDK (`pocketbase` package)
- [x] 3.5 Configure volume mount for source code hot-reload
- [x] 3.6 Expose SvelteKit dev server port (5173)
- [x] 3.7 Set up proper dependency on PocketBase service

## 4. Network and Environment Configuration
- [x] 4.1 Create Docker network for inter-service communication
- [x] 4.2 Configure environment variables for PocketBase URL in frontend
- [x] 4.3 Set up CORS configuration in PocketBase for frontend access
- [x] 4.4 Configure proper service hostnames for container networking

## 5. Development Experience Optimization
- [x] 5.1 Enable hot-reload for SvelteKit by mounting source as volume
- [x] 5.2 Configure Bun to watch for file changes
- [x] 5.3 Add restart policies for service resilience
- [x] 5.4 Configure proper logging for both services

## 6. Documentation and Tooling
- [x] 6.1 Create `README.md` with setup and usage instructions
- [x] 6.2 Document environment variables and their purposes
- [x] 6.3 Add common commands (start, stop, logs, reset)
- [x] 6.4 Create AI agent implementation guide
- [x] 6.5 Add troubleshooting section for common issues

## 7. Validation and Testing
- [x] 7.1 Verify PocketBase admin UI is accessible at http://localhost:8090/_/
- [x] 7.2 Verify SvelteKit dev server is accessible at http://localhost:5173
- [x] 7.3 Test frontend can communicate with PocketBase API
- [x] 7.4 Verify hot-reload works for frontend code changes
- [x] 7.5 Test data persistence across container restarts
- [x] 7.6 Verify clean startup from scratch (`docker compose down -v && docker compose up`)

## 8. Svelte 5 Runes Configuration
- [x] 8.1 Ensure Svelte 5 is installed (version 5.x)
- [x] 8.2 Configure svelte.config.js for Svelte 5 compatibility
- [x] 8.3 Create example component demonstrating runes ($state, $derived, $effect)
- [x] 8.4 Document runes usage patterns for the team
