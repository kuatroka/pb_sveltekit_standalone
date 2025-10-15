# Quick Start Guide

## 🚀 Get Running in 3 Commands

```bash
# 1. Copy environment file
cp .env.example .env

# 2. Start everything (builds images automatically on first run)
docker compose up

# 3. Open your browser
# - Frontend: http://localhost:5173
# - PocketBase Admin: http://localhost:8090/_/
```

## ⏱️ First Time Setup (5 minutes)

### Step 1: Start Services (2-3 min build time)
```bash
docker compose up
```

You'll see:
- ✅ PocketBase downloading and installing
- ✅ Bun dependencies installing
- ✅ Both services starting
- ✅ Health checks passing

### Step 2: Set Up PocketBase Admin (1 min)
1. Open http://localhost:8090/_/
2. Create admin account (first time only)
3. You now have access to PocketBase admin UI!

### Step 3: Create Test User (1 min)
1. In PocketBase admin, go to "Collections"
2. Open "users" collection
3. Click "New record"
4. Fill in email and password
5. Save

### Step 4: Test the Frontend (1 min)
1. Open http://localhost:5173
2. Use the login form with your test user credentials
3. See the Counter component demonstrating Svelte 5 runes!

## 🎯 Common Commands

```bash
# Start (with logs in terminal)
docker compose up

# Start (in background)
docker compose up -d

# Stop (keeps data)
docker compose down

# Stop and remove all data (clean slate)
docker compose down -v

# View logs
docker compose logs -f

# View specific service logs
docker compose logs -f frontend
docker compose logs -f pocketbase

# Restart a service
docker compose restart frontend

# Rebuild images
docker compose build

# Rebuild and restart
docker compose up --build
```

## 📝 Daily Development Workflow

### Morning Routine
```bash
# Start services
docker compose up -d

# View logs (optional)
docker compose logs -f
```

### During Development
- Edit files in `frontend/src/`
- Changes appear instantly in browser (hot-reload!)
- No need to restart anything

### End of Day
```bash
# Stop services (keeps data for tomorrow)
docker compose down
```

## 🔍 Troubleshooting

### "Port already in use"
```bash
# Option 1: Stop the conflicting service
lsof -i :8090  # Find what's using port 8090
lsof -i :5173  # Find what's using port 5173

# Option 2: Change ports in docker-compose.yml
# Edit ports section to use different host ports
```

### "Cannot connect to PocketBase"
```bash
# Check if PocketBase is healthy
docker compose ps

# View PocketBase logs
docker compose logs pocketbase

# Restart PocketBase
docker compose restart pocketbase
```

### "Hot reload not working"
```bash
# Restart frontend service
docker compose restart frontend

# Check if files are mounted correctly
docker compose exec frontend ls -la /app/src
```

### "Start fresh / reset everything"
```bash
# This removes ALL data and starts clean
docker compose down -v
docker compose up
```

## 📚 Learn Svelte 5 Runes

The project includes working examples of Svelte 5 runes:

### View the Counter Component
File: `frontend/src/lib/components/Counter.svelte`

### Three Main Runes

**$state** - Reactive variables
```svelte
let count = $state(0);
```

**$derived** - Computed values
```svelte
let doubled = $derived(count * 2);
```

**$effect** - Side effects
```svelte
$effect(() => {
  console.log('Count:', count);
});
```

## 🎨 Customize Your App

### Change PocketBase Version
Edit `docker-compose.yml`:
```yaml
args:
  PB_VERSION: 0.22.0  # Change this
```

### Add New Dependencies
```bash
# Enter frontend container
docker compose exec frontend sh

# Install package
bun add <package-name>

# Exit container
exit
```

### Change Ports
Edit `docker-compose.yml`:
```yaml
ports:
  - "8091:8090"  # PocketBase on 8091 instead of 8090
  - "3000:5173"  # Frontend on 3000 instead of 5173
```

Don't forget to update `.env` file:
```bash
VITE_POCKETBASE_URL=http://localhost:8091
```

## ✅ What You Get

- ✅ PocketBase backend with admin UI
- ✅ SvelteKit frontend with Svelte 5 runes
- ✅ Hot-reload for instant feedback
- ✅ Data persistence across restarts
- ✅ Authentication example
- ✅ TypeScript support
- ✅ Full Docker isolation

## 🆘 Need Help?

1. Check `README.md` for detailed documentation
2. Check `IMPLEMENTATION_SUMMARY.md` for technical details
3. View logs: `docker compose logs -f`
4. Restart services: `docker compose restart`
5. Start fresh: `docker compose down -v && docker compose up`

## 🎉 You're Ready!

Open http://localhost:5173 and start building!
