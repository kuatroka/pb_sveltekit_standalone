# PocketBase + SvelteKit Docker Development Environment

Modern Single Page Application (SPA) built with PocketBase backend and SvelteKit (Svelte 5 with runes) frontend, fully containerized with Docker Compose.

## Features

- **PocketBase Backend**: SQLite-based backend-as-a-service with REST API, authentication, and real-time subscriptions
- **SvelteKit Frontend**: Modern SPA framework with Svelte 5's runes for reactivity
- **Bun Runtime**: Fast JavaScript runtime and package manager
- **Docker Compose**: One-command development environment setup
- **Hot Reload**: Instant updates during development
- **Data Persistence**: PocketBase data survives container restarts

## Prerequisites

- Docker Desktop (Mac/Windows) or Docker Engine + Docker Compose (Linux)
- No other dependencies required - everything runs in containers!

## Quick Start

### 1. Clone and Setup

```bash
git clone <repo-url>
cd pb_sveltekit
cp .env.example .env
```

### 2. Start Development Environment

```bash
docker compose up
```

This command will:
- Build Docker images for PocketBase and SvelteKit
- Start both services
- Set up networking between containers
- Mount volumes for data persistence and hot-reload

**First startup takes 2-3 minutes to build images. Subsequent startups are instant.**

### 3. Access Applications

- **Frontend**: http://localhost:5173
- **PocketBase Admin**: http://localhost:8090/_/
- **PocketBase API**: http://localhost:8090/api/

### 4. Initial PocketBase Setup

1. Navigate to http://localhost:8090/_/
2. Create admin account on first visit
3. Create a "users" collection for authentication (or use the default one)
4. Add test users via admin UI
5. Return to frontend and try logging in

## Development Workflow

### Hot Reload

- **Frontend**: Edit files in `frontend/src/` - changes reflect immediately in browser
- **PocketBase**: Changes via admin UI persist automatically in the database

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f frontend
docker compose logs -f pocketbase

# Last 100 lines
docker compose logs --tail=100
```

### Stop Services

```bash
# Stop (preserves data)
docker compose down

# Stop and remove volumes (clean slate - loses all data!)
docker compose down -v
```

### Rebuild After Changes

```bash
# Rebuild specific service
docker compose build frontend
docker compose build pocketbase

# Rebuild all services
docker compose build

# Rebuild and restart
docker compose up --build
```

### Install New Dependencies

```bash
# Add package to frontend
docker compose exec frontend bun add <package-name>

# Add dev dependency
docker compose exec frontend bun add -d <package-name>

# The changes will be reflected in package.json on your host machine
```

## Svelte 5 Runes

This project uses Svelte 5's new runes for reactivity. See examples in the code:

### $state - Reactive State

```svelte
<script>
  let count = $state(0);
</script>

<button onclick={() => count++}>
  Count: {count}
</button>
```

### $derived - Computed Values

```svelte
<script>
  let count = $state(0);
  let doubled = $derived(count * 2);
</script>

<p>Double: {doubled}</p>
```

### $effect - Side Effects

```svelte
<script>
  let count = $state(0);

  $effect(() => {
    console.log('Count:', count);

    return () => {
      console.log('Cleanup');
    };
  });
</script>
```

See `frontend/src/lib/components/Counter.svelte` for a complete working example.

## Project Structure

```
/
├── docker-compose.yml          # Service orchestration
├── .env.example                # Environment template
├── .dockerignore               # Build exclusions
├── .gitignore                  # Git exclusions
├── pocketbase/
│   ├── Dockerfile              # PocketBase image
│   ├── .dockerignore           # PocketBase build exclusions
│   └── pb_data/                # Database (Docker volume, not in git)
├── frontend/
│   ├── Dockerfile              # Frontend image
│   ├── .dockerignore           # Frontend build exclusions
│   ├── package.json            # Dependencies
│   ├── svelte.config.js        # SvelteKit + SPA config
│   ├── vite.config.ts          # Vite dev server config
│   ├── tsconfig.json           # TypeScript config
│   ├── src/
│   │   ├── app.html            # HTML template
│   │   ├── lib/
│   │   │   ├── components/     # Svelte components
│   │   │   │   └── Counter.svelte
│   │   │   ├── services/       # API services
│   │   │   │   └── pocketbase.ts
│   │   │   ├── stores/         # State stores (runes)
│   │   │   │   └── auth.svelte.ts
│   │   │   └── types/          # TypeScript types
│   │   └── routes/             # SvelteKit pages
│   │       ├── +layout.svelte  # Main layout
│   │       └── +page.svelte    # Home page
│   └── static/                 # Static assets
└── README.md                   # This file
```

## Environment Variables

Copy `.env.example` to `.env` and customize as needed:

```bash
# PocketBase URL (accessible from browser)
VITE_POCKETBASE_URL=http://localhost:8090

# PocketBase version (optional)
PB_VERSION=0.22.0

# Ports (change if conflicts occur)
POCKETBASE_PORT=8090
FRONTEND_PORT=5173
```

## Troubleshooting

### Port Already in Use

```bash
# Find process using port (macOS/Linux)
lsof -i :8090

# Find process using port (Windows)
netstat -ano | findstr :8090

# Option 1: Kill the process
# Option 2: Change ports in docker-compose.yml
ports:
  - "8091:8090"  # Different host port
```

### Frontend Can't Connect to PocketBase

1. Verify PocketBase is healthy:
   ```bash
   docker compose ps
   ```

2. Check PocketBase logs:
   ```bash
   docker compose logs pocketbase
   ```

3. Verify environment variable:
   ```bash
   cat .env
   ```

4. Restart services:
   ```bash
   docker compose restart
   ```

### Hot Reload Not Working

1. Ensure source is mounted (check docker-compose.yml)

2. Check Vite is watching files:
   ```bash
   docker compose logs frontend
   ```

3. Try restarting frontend:
   ```bash
   docker compose restart frontend
   ```

### Data Reset Required

To start fresh with clean database:

```bash
# Remove all data and start fresh
docker compose down -v
docker compose up
```

**Warning**: This deletes all PocketBase data including users and collections!

### Build Errors

If you encounter build errors:

```bash
# Clean rebuild
docker compose down
docker compose build --no-cache
docker compose up
```

### Permission Issues (Linux)

If you encounter permission issues on Linux:

```bash
# Option 1: Run with current user
docker compose run --user $(id -u):$(id -g) frontend bun install

# Option 2: Fix ownership
sudo chown -R $USER:$USER frontend/node_modules
```

## Useful Commands

```bash
# View running containers
docker compose ps

# Execute command in container
docker compose exec frontend bun install <package>
docker compose exec pocketbase sh

# Access container shell
docker compose exec frontend sh
docker compose exec pocketbase sh

# View resource usage
docker stats

# Clean up everything (including images)
docker compose down -v --rmi all

# Restart single service
docker compose restart frontend
docker compose restart pocketbase
```

## Production Deployment

This setup is for **development only**. For production:

- Create separate `docker-compose.prod.yml`
- Build optimized frontend: `bun run build`
- Serve static files with nginx or CDN
- Configure proper PocketBase security rules
- Use environment-specific `.env` files
- Implement SSL/TLS certificates
- Set up proper backup strategy for PocketBase data
- Configure proper CORS policies
- Use secrets management for sensitive data

## Learn More

- [PocketBase Documentation](https://pocketbase.io/docs/)
- [SvelteKit Documentation](https://kit.svelte.dev/)
- [Svelte 5 Runes](https://svelte.dev/docs/svelte/what-are-runes)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Bun Documentation](https://bun.sh/docs)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with `docker compose up`
5. Submit a pull request

## License

MIT License - see LICENSE file for details
