# Docker Compose Environment Design

## Context
The project is a Single Page Application using PocketBase backend and SvelteKit (Svelte 5) frontend. Currently, developers must manually install:
- PocketBase executable
- Bun runtime
- Node.js-based tooling
- Configure ports, CORS, and environment variables

This creates:
- Inconsistent environments across machines
- Complex onboarding process
- Version mismatch issues
- Manual cleanup when resetting environment

## Goals / Non-Goals

### Goals
- Provide one-command development environment startup
- Ensure consistent runtime versions across all developers
- Enable hot-reload for rapid development iteration
- Persist PocketBase data across container restarts
- Simplify onboarding to <5 minutes
- Support both Mac, Linux, and Windows (via Docker Desktop)

### Non-Goals
- Production deployment configuration (separate concern)
- Multi-environment orchestration (dev/staging/prod)
- CI/CD pipeline integration (future enhancement)
- Database migration tooling (PocketBase handles this)
- SSL/TLS configuration (local development only)

## Decisions

### Decision 1: Two-Service Architecture
**Choice**: Separate containers for PocketBase and SvelteKit frontend

**Why**:
- Mirrors production architecture (separate backend/frontend)
- Allows independent scaling and versioning
- Clear separation of concerns
- Easier to troubleshoot issues

**Alternatives Considered**:
- Single container with both services: Violates Docker best practices, harder to manage
- Three containers (+ nginx): Overkill for local development

### Decision 2: Bun as Frontend Runtime
**Choice**: Use official Bun Docker image for frontend container

**Why**:
- Project specification requires Bun (not Node.js)
- Bun has official Docker images (oven/bun)
- Faster package installation than npm/pnpm
- Built-in TypeScript support

**Alternatives Considered**:
- Node.js Alpine: Project spec requires Bun
- Custom Bun build: Official image is maintained and optimized

### Decision 3: Volume Mounting Strategy
**Choice**:
- PocketBase: Named volume for `pb_data` (database persistence)
- SvelteKit: Bind mount for source code (hot-reload)

**Why**:
- PocketBase data must persist across container recreations
- Frontend source needs real-time sync for hot-reload
- Node_modules/bun packages should stay in container (performance)

**Alternatives Considered**:
- All bind mounts: Slower on Mac/Windows due to file system overhead
- All named volumes: Can't edit source code from host

### Decision 4: PocketBase Image Strategy
**Choice**: Build custom Alpine-based image that downloads PocketBase

**Why**:
- No official PocketBase Docker image
- Alpine Linux is lightweight (5MB base)
- Allows version pinning
- Simple Dockerfile (3-4 instructions)

**Alternatives Considered**:
- Use community images: Not officially maintained, version lag
- Download at runtime: Slower startup, network dependency every time

### Decision 5: Port Mapping
**Choice**:
- PocketBase: 8090:8090 (standard PocketBase port)
- SvelteKit: 5173:5173 (Vite default port)

**Why**:
- Matches documentation and developer expectations
- No port conflicts on typical development machines
- Easy to remember (PocketBase admin at :8090/_/)

**Alternatives Considered**:
- Different ports: Requires mental mapping, breaks muscle memory
- Dynamic ports: Harder to document and remember

### Decision 6: Network Configuration
**Choice**: Single Docker bridge network for all services

**Why**:
- Services need to communicate (frontend → backend)
- Docker DNS provides automatic service discovery
- Simple configuration, no manual IP management

**Alternatives Considered**:
- Host networking: Breaks isolation, platform-dependent
- Multiple networks: Unnecessary complexity for two services

### Decision 7: Environment Variables
**Choice**: `.env` file for configuration with `.env.example` template

**Why**:
- Standard pattern developers expect
- Prevents committing secrets
- Easy to customize per developer

**Alternatives Considered**:
- Hardcoded in docker-compose.yml: Can't customize, security risk
- Separate config files: More files to manage

### Decision 8: Svelte 5 with Runes
**Choice**: Configure SvelteKit with Svelte 5.x and demonstrate runes usage

**Why**:
- Runes are the new reactivity system in Svelte 5
- Replaces `$:` reactive statements with explicit `$state`, `$derived`, `$effect`
- More predictable and easier to understand
- Required by project specification

**Key Runes**:
- `$state` - Reactive state variables
- `$derived` - Computed values
- `$effect` - Side effects and lifecycle

## Technical Specifications

### Docker Compose Structure
```yaml
services:
  pocketbase:
    - Alpine-based custom image
    - Port 8090 exposed
    - Volume: pb_data (named)
    - Health check: HTTP GET /_/

  frontend:
    - Bun official image
    - Port 5173 exposed
    - Volumes:
      - source code (bind mount)
      - node_modules (anonymous)
    - Depends on: pocketbase
    - Environment: VITE_POCKETBASE_URL
```

### File Structure
```
/
├── docker-compose.yml          # Orchestration config
├── .env.example                # Environment template
├── .dockerignore               # Build exclusions
├── pocketbase/
│   ├── Dockerfile              # PocketBase image
│   └── pb_data/                # Data directory (volume)
├── frontend/
│   ├── Dockerfile              # Frontend image
│   ├── src/                    # SvelteKit source (bind mount)
│   ├── package.json
│   ├── bun.lockb
│   └── svelte.config.js        # Svelte 5 config
└── README.md                   # Setup guide
```

### PocketBase Dockerfile
```dockerfile
FROM alpine:latest
ARG PB_VERSION=0.22.0
RUN apk add --no-cache wget unzip ca-certificates
RUN wget https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip \
    && unzip pocketbase_${PB_VERSION}_linux_amd64.zip \
    && rm pocketbase_${PB_VERSION}_linux_amd64.zip \
    && chmod +x pocketbase
EXPOSE 8090
CMD ["./pocketbase", "serve", "--http=0.0.0.0:8090"]
```

### Frontend Dockerfile
```dockerfile
FROM oven/bun:latest
WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install
COPY . .
EXPOSE 5173
CMD ["bun", "run", "dev", "--host", "0.0.0.0"]
```

## Risks / Trade-offs

### Risk 1: Docker Learning Curve
**Risk**: Developers unfamiliar with Docker may struggle initially

**Mitigation**:
- Provide comprehensive README with common commands
- Include troubleshooting section
- Document escape hatches (running without Docker)
- Offer quick reference cheat sheet

### Risk 2: Performance on macOS/Windows
**Risk**: Bind mounts can be slow on non-Linux hosts

**Mitigation**:
- Use anonymous volumes for node_modules (stays in container)
- Document osxfs/wsl2 performance considerations
- Provide Linux development as preferred option
- Consider mutagen/docker-sync for large projects (future)

### Risk 3: Port Conflicts
**Risk**: Ports 8090 or 5173 may be in use

**Mitigation**:
- Document how to change ports in docker-compose.yml
- Check for conflicts in setup guide
- Provide netstat/lsof commands for troubleshooting

### Risk 4: Volume Data Loss
**Risk**: Developers may accidentally delete volumes

**Mitigation**:
- Document difference between `down` and `down -v`
- Add warning comments in docker-compose.yml
- Provide backup/restore instructions
- Use named volumes (explicit, visible in `docker volume ls`)

### Risk 5: Bun Ecosystem Maturity
**Risk**: Bun is newer, may have compatibility issues

**Mitigation**:
- Pin specific Bun version in Dockerfile
- Test with latest Bun version before updating
- Document known issues and workarounds
- Provide fallback to Node.js if critical issues arise

## Migration Plan

### Phase 1: Initial Setup (Week 1)
1. Create Docker configuration files
2. Build and test PocketBase container
3. Build and test SvelteKit container
4. Verify inter-service communication

### Phase 2: Developer Migration (Week 2)
1. Update documentation with Docker instructions
2. Test on Mac, Linux, Windows
3. Conduct team walkthrough session
4. Gather feedback and iterate

### Phase 3: Optimization (Ongoing)
1. Monitor performance issues
2. Optimize build times with layer caching
3. Add convenience scripts (make/task)
4. Expand troubleshooting guide

### Rollback Plan
If Docker causes critical issues:
1. Keep manual setup documentation
2. Docker is optional, not required
3. Revert to local installation instructions
4. Re-evaluate after Bun ecosystem matures

## Open Questions

1. **PocketBase Version**: Which version should we pin? Latest stable (0.22.x) or LTS?
   - **Decision**: Use latest stable, document how to change version

2. **Development vs Production**: Should docker-compose.yml include production config?
   - **Decision**: No, create separate docker-compose.prod.yml later

3. **Database Seeding**: How to provide initial data for development?
   - **Decision**: Manual via PocketBase admin UI initially, add seed script later

4. **SSL in Development**: Do we need HTTPS locally?
   - **Decision**: No, HTTP is sufficient for local development

5. **Bun Version**: Pin to specific version or use `latest`?
   - **Decision**: Pin to specific version (currently 1.1.x) for reproducibility
