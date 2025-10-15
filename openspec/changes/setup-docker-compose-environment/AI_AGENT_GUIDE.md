# AI Agent Implementation Guide: Docker Compose Environment Setup

## Overview
This guide provides step-by-step instructions for an AI agent to implement the complete Docker Compose development environment for a PocketBase + SvelteKit (Svelte 5 with runes) web application.

## Prerequisites Knowledge
- Docker and Docker Compose concepts
- PocketBase architecture (SQLite-based BaaS)
- SvelteKit framework basics
- Svelte 5 runes syntax
- Bun runtime usage

## Implementation Phases

### Phase 1: Project Structure Setup

#### Step 1.1: Create Directory Structure
```bash
# Create all required directories
mkdir -p pocketbase
mkdir -p frontend/src/{lib/{components,services,stores,types},routes}
mkdir -p frontend/static
```

#### Step 1.2: Create .dockerignore Files
Create `pocketbase/.dockerignore`:
```
# Exclude data directory from build context
pb_data/
pb_migrations/
*.log
.DS_Store
```

Create `frontend/.dockerignore` (or root `.dockerignore` if frontend is in root):
```
# Dependencies
node_modules/
bun.lockb

# Build outputs
.svelte-kit/
build/
dist/

# Environment
.env
.env.*
!.env.example

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Git
.git/
.gitignore

# Testing
coverage/
.nyc_output/

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
```

### Phase 2: PocketBase Service Setup

#### Step 2.1: Create PocketBase Dockerfile
Create `pocketbase/Dockerfile`:
```dockerfile
# Use Alpine Linux for minimal image size
FROM alpine:latest

# Define PocketBase version as build argument for easy updates
ARG PB_VERSION=0.22.0

# Install required system packages
RUN apk add --no-cache \
    ca-certificates \
    wget \
    unzip

# Download and install PocketBase
RUN wget https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip \
    && unzip pocketbase_${PB_VERSION}_linux_amd64.zip \
    && rm pocketbase_${PB_VERSION}_linux_amd64.zip \
    && chmod +x pocketbase

# Create data directory
RUN mkdir -p /pb_data

# Expose PocketBase default port
EXPOSE 8090

# Health check to verify PocketBase is responding
HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8090/_/ || exit 1

# Start PocketBase server
# --http=0.0.0.0:8090 makes it accessible from outside container
CMD ["./pocketbase", "serve", "--http=0.0.0.0:8090"]
```

**Key Points for AI Agent**:
- `ARG PB_VERSION` allows easy version updates
- Alpine base keeps image small (~40MB)
- Health check ensures service is ready before dependent services start
- `0.0.0.0` binding is essential for Docker networking
- `/pb_data` directory will be mounted as volume

### Phase 3: SvelteKit Frontend Setup

#### Step 3.1: Initialize SvelteKit Project
Create `frontend/package.json`:
```json
{
  "name": "frontend",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "preview": "vite preview",
    "check": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json",
    "check:watch": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json --watch"
  },
  "devDependencies": {
    "@sveltejs/adapter-static": "^3.0.0",
    "@sveltejs/kit": "^2.0.0",
    "@sveltejs/vite-plugin-svelte": "^3.0.0",
    "svelte": "^5.0.0",
    "svelte-check": "^3.6.0",
    "tslib": "^2.6.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0"
  },
  "dependencies": {
    "pocketbase": "^0.21.0"
  },
  "type": "module"
}
```

#### Step 3.2: Create SvelteKit Configuration
Create `frontend/svelte.config.js`:
```javascript
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Preprocess with Vite for TypeScript, PostCSS, etc.
  preprocess: vitePreprocess(),

  kit: {
    // Use static adapter for SPA mode
    adapter: adapter({
      // Output directory for built files
      pages: 'build',
      assets: 'build',
      // Fallback for client-side routing
      fallback: 'index.html',
      // Prerender only the fallback page
      precompress: false,
      strict: true
    }),
    // Disable server-side rendering (SPA mode)
    ssr: false,
    // Prerender configuration
    prerender: {
      entries: []
    }
  },

  // Svelte 5 compiler options
  compilerOptions: {
    // Runes are enabled by default in Svelte 5
    runes: true
  }
};

export default config;
```

#### Step 3.3: Create Vite Configuration
Create `frontend/vite.config.ts`:
```typescript
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  server: {
    // Listen on all interfaces for Docker
    host: '0.0.0.0',
    port: 5173,
    // Enable HMR
    hmr: {
      // Use host's localhost for WebSocket connection
      clientPort: 5173
    },
    // Watch configuration for hot reload
    watch: {
      usePolling: true // Required for some Docker setups
    }
  }
});
```

#### Step 3.4: Create TypeScript Configuration
Create `frontend/tsconfig.json`:
```json
{
  "extends": "./.svelte-kit/tsconfig.json",
  "compilerOptions": {
    "allowJs": true,
    "checkJs": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "sourceMap": true,
    "strict": true,
    "moduleResolution": "bundler",
    "module": "ESNext",
    "target": "ESNext"
  }
}
```

#### Step 3.5: Create Frontend Dockerfile
Create `frontend/Dockerfile`:
```dockerfile
# Use official Bun image
FROM oven/bun:1.1-alpine

# Set working directory
WORKDIR /app

# Copy package files for dependency installation
COPY package.json bun.lockb* ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Expose Vite dev server port
EXPOSE 5173

# Start development server
# --host 0.0.0.0 makes it accessible from outside container
CMD ["bun", "run", "dev", "--host", "0.0.0.0"]
```

**Key Points for AI Agent**:
- Bun 1.1-alpine provides Bun runtime with minimal footprint
- `--frozen-lockfile` ensures reproducible installs
- Dependencies layer is cached separately from source code
- `--host 0.0.0.0` is critical for Docker access

### Phase 4: Docker Compose Orchestration

#### Step 4.1: Create docker-compose.yml
Create `docker-compose.yml` in project root:
```yaml
version: '3.8'

services:
  # PocketBase backend service
  pocketbase:
    build:
      context: ./pocketbase
      dockerfile: Dockerfile
      args:
        PB_VERSION: 0.22.0
    container_name: pocketbase
    restart: unless-stopped
    ports:
      - "8090:8090"
    volumes:
      # Persistent volume for database and files
      - pb_data:/pb_data
      # Optional: Mount migrations directory if it exists
      # - ./pocketbase/pb_migrations:/pb_migrations
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:8090/_/"]
      interval: 10s
      timeout: 3s
      retries: 3
      start_period: 5s
    networks:
      - app-network

  # SvelteKit frontend service
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: frontend
    restart: unless-stopped
    ports:
      - "5173:5173"
    volumes:
      # Bind mount source code for hot reload
      - ./frontend:/app
      # Anonymous volume for node_modules (keeps container's packages)
      - /app/node_modules
      - /app/.svelte-kit
    environment:
      # PocketBase URL for browser (via host machine)
      - VITE_POCKETBASE_URL=${VITE_POCKETBASE_URL:-http://localhost:8090}
      # Internal URL for server-side calls (if needed)
      - INTERNAL_POCKETBASE_URL=http://pocketbase:8090
    depends_on:
      pocketbase:
        condition: service_healthy
    networks:
      - app-network

# Named volume for PocketBase data persistence
volumes:
  pb_data:
    driver: local

# Network for service communication
networks:
  app-network:
    driver: bridge
```

**Key Points for AI Agent**:
- `depends_on` with `condition: service_healthy` ensures startup order
- Named volume `pb_data` persists across container restarts
- Anonymous volumes for `node_modules` prevent host interference
- Bridge network enables service-to-service communication
- `restart: unless-stopped` provides resilience

#### Step 4.2: Create .env.example
Create `.env.example` in project root:
```bash
# PocketBase Configuration
# URL accessible from browser (host machine)
VITE_POCKETBASE_URL=http://localhost:8090

# Optional: PocketBase version to use
PB_VERSION=0.22.0

# Development Settings
# Set to 'true' to enable verbose logging
DEBUG=false

# Port Configuration (change if defaults conflict)
POCKETBASE_PORT=8090
FRONTEND_PORT=5173
```

### Phase 5: SvelteKit Application Code

#### Step 5.1: Create PocketBase Service
Create `frontend/src/lib/services/pocketbase.ts`:
```typescript
import PocketBase from 'pocketbase';

// Initialize PocketBase client with environment variable
const pb = new PocketBase(import.meta.env.VITE_POCKETBASE_URL || 'http://localhost:8090');

// Enable auto-cancellation of pending requests
pb.autoCancellation(false);

export default pb;
```

#### Step 5.2: Create Example Store with Runes
Create `frontend/src/lib/stores/auth.svelte.ts`:
```typescript
import pb from '$lib/services/pocketbase';
import type { AuthModel } from 'pocketbase';

// Svelte 5 runes-based store
class AuthStore {
  // $state rune creates reactive state
  user = $state<AuthModel | null>(null);
  isAuthenticated = $state<boolean>(false);

  constructor() {
    // Initialize from PocketBase auth store
    this.user = pb.authStore.model;
    this.isAuthenticated = pb.authStore.isValid;

    // Listen for auth changes
    pb.authStore.onChange(() => {
      this.user = pb.authStore.model;
      this.isAuthenticated = pb.authStore.isValid;
    });
  }

  async login(email: string, password: string) {
    try {
      const authData = await pb.collection('users').authWithPassword(email, password);
      this.user = authData.record;
      this.isAuthenticated = true;
      return authData;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  logout() {
    pb.authStore.clear();
    this.user = null;
    this.isAuthenticated = false;
  }
}

// Export singleton instance
export const authStore = new AuthStore();
```

#### Step 5.3: Create Example Component with Runes
Create `frontend/src/lib/components/Counter.svelte`:
```svelte
<script lang="ts">
  // Svelte 5 runes syntax

  // $state creates reactive state
  let count = $state(0);

  // $derived creates computed value
  let doubled = $derived(count * 2);
  let message = $derived(count === 0 ? 'Start counting!' : `Count is ${count}`);

  // $effect runs side effects
  $effect(() => {
    console.log('Count changed:', count);

    // Return cleanup function (optional)
    return () => {
      console.log('Effect cleanup');
    };
  });

  function increment() {
    count++;
  }

  function decrement() {
    count--;
  }

  function reset() {
    count = 0;
  }
</script>

<div class="counter">
  <h2>Counter Example (Svelte 5 Runes)</h2>

  <p class="message">{message}</p>

  <div class="controls">
    <button onclick={decrement}>-</button>
    <span class="count">{count}</span>
    <button onclick={increment}>+</button>
  </div>

  <p class="derived">Doubled: {doubled}</p>

  <button onclick={reset} class="reset">Reset</button>
</div>

<style>
  .counter {
    padding: 2rem;
    text-align: center;
    font-family: system-ui, -apple-system, sans-serif;
  }

  .message {
    font-size: 1.2rem;
    margin-bottom: 1rem;
  }

  .controls {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    margin: 1rem 0;
  }

  .count {
    font-size: 2rem;
    font-weight: bold;
    min-width: 3rem;
  }

  button {
    padding: 0.5rem 1rem;
    font-size: 1rem;
    cursor: pointer;
    border: 1px solid #ccc;
    border-radius: 4px;
    background: white;
  }

  button:hover {
    background: #f0f0f0;
  }

  .reset {
    margin-top: 1rem;
  }

  .derived {
    color: #666;
    font-style: italic;
  }
</style>
```

#### Step 5.4: Create Main Layout
Create `frontend/src/routes/+layout.svelte`:
```svelte
<script lang="ts">
  import { authStore } from '$lib/stores/auth.svelte';
</script>

<div class="app">
  <header>
    <h1>PocketBase + SvelteKit App</h1>
    {#if authStore.isAuthenticated}
      <p>Logged in as: {authStore.user?.email}</p>
      <button onclick={() => authStore.logout()}>Logout</button>
    {:else}
      <p>Not logged in</p>
    {/if}
  </header>

  <main>
    <slot />
  </main>

  <footer>
    <p>Built with PocketBase, SvelteKit, and Svelte 5 runes</p>
  </footer>
</div>

<style>
  .app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  header {
    padding: 1rem;
    background: #f5f5f5;
    border-bottom: 1px solid #ddd;
  }

  main {
    flex: 1;
    padding: 2rem;
  }

  footer {
    padding: 1rem;
    background: #f5f5f5;
    border-top: 1px solid #ddd;
    text-align: center;
  }
</style>
```

#### Step 5.5: Create Home Page
Create `frontend/src/routes/+page.svelte`:
```svelte
<script lang="ts">
  import Counter from '$lib/components/Counter.svelte';
  import { authStore } from '$lib/stores/auth.svelte';

  // Example of reactive state with runes
  let email = $state('');
  let password = $state('');
  let loading = $state(false);
  let error = $state<string | null>(null);

  async function handleLogin() {
    loading = true;
    error = null;

    try {
      await authStore.login(email, password);
    } catch (err) {
      error = 'Login failed. Please check your credentials.';
      console.error(err);
    } finally {
      loading = false;
    }
  }
</script>

<div class="home">
  <h2>Welcome to Your App</h2>

  {#if !authStore.isAuthenticated}
    <section class="login">
      <h3>Login</h3>
      <form onsubmit={(e) => { e.preventDefault(); handleLogin(); }}>
        <input
          type="email"
          bind:value={email}
          placeholder="Email"
          required
        />
        <input
          type="password"
          bind:value={password}
          placeholder="Password"
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
        {#if error}
          <p class="error">{error}</p>
        {/if}
      </form>
    </section>
  {/if}

  <section>
    <Counter />
  </section>

  <section class="info">
    <h3>Environment Info</h3>
    <p>PocketBase URL: {import.meta.env.VITE_POCKETBASE_URL}</p>
    <p>Auth Status: {authStore.isAuthenticated ? 'Authenticated' : 'Not authenticated'}</p>
  </section>
</div>

<style>
  .home {
    max-width: 800px;
    margin: 0 auto;
  }

  section {
    margin: 2rem 0;
    padding: 1.5rem;
    border: 1px solid #ddd;
    border-radius: 8px;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-width: 400px;
  }

  input {
    padding: 0.5rem;
    font-size: 1rem;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  button {
    padding: 0.75rem;
    font-size: 1rem;
    cursor: pointer;
    border: none;
    border-radius: 4px;
    background: #4CAF50;
    color: white;
  }

  button:hover:not(:disabled) {
    background: #45a049;
  }

  button:disabled {
    background: #ccc;
    cursor: not-allowed;
  }

  .error {
    color: red;
    margin-top: 0.5rem;
  }

  .info p {
    margin: 0.5rem 0;
  }
</style>
```

#### Step 5.6: Create App HTML Template
Create `frontend/src/app.html`:
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%sveltekit.assets%/favicon.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    %sveltekit.head%
  </head>
  <body data-sveltekit-preload-data="hover">
    <div style="display: contents">%sveltekit.body%</div>
  </body>
</html>
```

### Phase 6: Documentation

#### Step 6.1: Create README.md
Create `README.md` in project root:
```markdown
# PocketBase + SvelteKit Docker Development Environment

Modern SPA built with PocketBase backend and SvelteKit (Svelte 5 with runes) frontend, fully containerized with Docker Compose.

## Prerequisites

- Docker Desktop (Mac/Windows) or Docker Engine + Docker Compose (Linux)
- No other dependencies required - everything runs in containers!

## Quick Start

1. **Clone and Setup**
   ```bash
   git clone <repo-url>
   cd <project-directory>
   cp .env.example .env
   ```

2. **Start Development Environment**
   ```bash
   docker compose up
   ```

3. **Access Applications**
   - Frontend: http://localhost:5173
   - PocketBase Admin: http://localhost:8090/_/
   - PocketBase API: http://localhost:8090/api/

4. **Initial PocketBase Setup**
   - Navigate to http://localhost:8090/_/
   - Create admin account on first visit
   - Create collections and configure auth as needed

## Development Workflow

### Hot Reload
- **Frontend**: Edit files in `frontend/src/` - changes reflect immediately
- **PocketBase**: Changes via admin UI persist automatically

### View Logs
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f frontend
docker compose logs -f pocketbase
```

### Stop Services
```bash
# Stop (preserves data)
docker compose down

# Stop and remove volumes (clean slate)
docker compose down -v
```

### Rebuild After Dependency Changes
```bash
# Rebuild specific service
docker compose build frontend

# Rebuild all services
docker compose build

# Rebuild and restart
docker compose up --build
```

## Svelte 5 Runes Examples

This project uses Svelte 5's runes for reactivity:

### $state - Reactive State
```svelte
<script>
  let count = $state(0);
</script>
```

### $derived - Computed Values
```svelte
<script>
  let count = $state(0);
  let doubled = $derived(count * 2);
</script>
```

### $effect - Side Effects
```svelte
<script>
  let count = $state(0);

  $effect(() => {
    console.log('Count:', count);
    return () => console.log('Cleanup');
  });
</script>
```

See `frontend/src/lib/components/Counter.svelte` for complete examples.

## Project Structure

```
/
├── docker-compose.yml          # Service orchestration
├── .env.example                # Environment template
├── pocketbase/
│   ├── Dockerfile              # PocketBase image
│   └── pb_data/                # Database (Docker volume)
├── frontend/
│   ├── Dockerfile              # Frontend image
│   ├── src/
│   │   ├── lib/
│   │   │   ├── components/     # Svelte components
│   │   │   ├── services/       # API services
│   │   │   ├── stores/         # State stores (runes)
│   │   │   └── types/          # TypeScript types
│   │   └── routes/             # SvelteKit pages
│   ├── svelte.config.js        # SvelteKit config
│   └── vite.config.ts          # Vite config
└── README.md
```

## Troubleshooting

### Port Already in Use
```bash
# Find process using port
lsof -i :8090  # macOS/Linux
netstat -ano | findstr :8090  # Windows

# Change ports in docker-compose.yml
ports:
  - "8091:8090"  # Different host port
```

### Frontend Can't Connect to PocketBase
1. Verify PocketBase is healthy: `docker compose ps`
2. Check logs: `docker compose logs pocketbase`
3. Verify environment variable: `echo $VITE_POCKETBASE_URL`

### Hot Reload Not Working
1. Ensure source is mounted: `docker compose config`
2. Check Vite is watching: `docker compose logs frontend`
3. Try restarting: `docker compose restart frontend`

### Data Reset Required
```bash
# Remove all data and start fresh
docker compose down -v
docker compose up
```

## Useful Commands

```bash
# View running containers
docker compose ps

# Execute command in container
docker compose exec frontend bun install <package>
docker compose exec pocketbase ./pocketbase migrate

# Access container shell
docker compose exec frontend sh
docker compose exec pocketbase sh

# View resource usage
docker stats

# Clean up everything
docker compose down -v --rmi all
```

## Production Deployment

This setup is for **development only**. For production:
- Use separate `docker-compose.prod.yml`
- Build optimized frontend: `bun run build`
- Serve static files with nginx or CDN
- Configure proper PocketBase security rules
- Use environment-specific `.env` files
- Implement SSL/TLS certificates

## Learn More

- [PocketBase Documentation](https://pocketbase.io/docs/)
- [SvelteKit Documentation](https://kit.svelte.dev/)
- [Svelte 5 Runes](https://svelte-5-preview.vercel.app/docs/runes)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Bun Documentation](https://bun.sh/docs)
```

### Phase 7: Validation Steps for AI Agent

After implementing all files, the AI agent should verify:

#### Verification Checklist
1. **File Structure Check**
   ```bash
   # Verify all files exist
   ls -la docker-compose.yml .env.example
   ls -la pocketbase/Dockerfile pocketbase/.dockerignore
   ls -la frontend/Dockerfile frontend/.dockerignore
   ls -la frontend/package.json frontend/svelte.config.js frontend/vite.config.ts
   ```

2. **YAML Validation**
   ```bash
   docker compose config  # Should parse without errors
   ```

3. **Build Images**
   ```bash
   docker compose build
   # Should complete without errors for both services
   ```

4. **Start Services**
   ```bash
   docker compose up -d
   # Wait 10-15 seconds for services to start
   ```

5. **Check Service Health**
   ```bash
   docker compose ps
   # Both services should show "healthy" or "running"
   ```

6. **Verify Access**
   ```bash
   # Test PocketBase
   curl http://localhost:8090/_/
   # Should return HTML

   # Test Frontend
   curl http://localhost:5173
   # Should return HTML
   ```

7. **Test Hot Reload**
   - Edit `frontend/src/routes/+page.svelte`
   - Save file
   - Browser should auto-refresh

8. **Test Data Persistence**
   ```bash
   # Create data in PocketBase admin UI
   # Stop services
   docker compose down
   # Restart
   docker compose up -d
   # Data should still exist
   ```

9. **Test Clean Reset**
   ```bash
   docker compose down -v
   docker compose up -d
   # Should require PocketBase initial setup again
   ```

## Common Issues and Solutions

### Issue 1: Bun Install Fails
**Solution**: Ensure `bun.lockb` exists or remove it from `COPY` command:
```dockerfile
COPY package.json bun.lockb* ./
```

### Issue 2: Permission Denied on Linux
**Solution**: Adjust volume permissions or run with user:
```yaml
user: "${UID}:${GID}"
```

### Issue 3: Port Conflicts
**Solution**: Change host port in docker-compose.yml:
```yaml
ports:
  - "8091:8090"  # Different host port, same container port
```

### Issue 4: Slow Performance on Mac/Windows
**Solution**: Consider using Docker volume instead of bind mount:
```yaml
volumes:
  - frontend-src:/app  # Named volume instead of bind mount
```

### Issue 5: WebSocket Connection Fails
**Solution**: Ensure HMR configuration in vite.config.ts:
```typescript
server: {
  hmr: {
    clientPort: 5173
  }
}
```

## Summary

This implementation provides:
- ✅ Complete Docker Compose environment
- ✅ PocketBase backend with data persistence
- ✅ SvelteKit frontend with Svelte 5 runes
- ✅ Hot reload for both services
- ✅ One-command startup
- ✅ Comprehensive documentation
- ✅ Production-ready project structure

The AI agent can now proceed with implementation following this guide step-by-step.
