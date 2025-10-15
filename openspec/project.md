# Project Context

## Purpose
This project is a Single Page Application (SPA) built with PocketBase as the backend and SvelteKit as the frontend. The goal is to create a modern, full-stack web application with real-time capabilities, authentication, and database management provided by PocketBase, combined with SvelteKit's client-side routing and reactive UI capabilities.

## Tech Stack

### Backend
- **PocketBase** - Backend-as-a-Service providing:
  - SQLite database
  - RESTful API
  - Real-time subscriptions
  - Authentication & authorization
  - File storage
  - Admin dashboard

### Frontend
- **SvelteKit** - Full-stack web framework configured as SPA with:
  - Client-side rendering (SPA mode)
  - File-based routing
  - TypeScript support
  - Vite for build tooling
- **Svelte** - Reactive component framework
- **TypeScript** - Type-safe JavaScript

### Development Tools
- **Vite** - Build tool and dev server
- **Bun** - JavaScript runtime and package manager
- **ESLint** - Code linting
- **Prettier** - Code formatting

## Project Conventions

### Code Style
- Use TypeScript for type safety
- Follow Svelte/SvelteKit conventions:
  - `+page.svelte` for pages
  - `+server.ts` for API endpoints
  - `+layout.svelte` for layouts
  - `+page.ts` for page data loading
- Component naming: PascalCase for component files
- Utility functions: camelCase
- Constants: UPPER_SNAKE_CASE
- Use Prettier with default settings for formatting
- ESLint for code quality

### Architecture Patterns
- **Single Page Application**: Client-side routing with no server-side rendering
- **Frontend-Backend Separation**: SvelteKit SPA communicates with PocketBase via REST API
- **Real-time Updates**: Use PocketBase's real-time subscriptions for live data
- **Authentication Flow**: Handle auth tokens client-side with PocketBase SDK
- **API Abstraction**: Create service layer in SvelteKit to interact with PocketBase
- **Route Protection**: Use client-side navigation guards for authentication
- **Static Site Generation**: Build outputs static files for deployment to CDN/static hosts
- **Environment Configuration**: Separate configs for dev/staging/production

### Testing Strategy
- Unit tests for utility functions and services
- Component tests for Svelte components
- Integration tests for API routes
- E2E tests for critical user flows
- Testing framework: Vitest (Vite-native testing)
- Component testing: @testing-library/svelte
- E2E testing: Playwright (optional)

### Git Workflow
- **Main branch**: `main` - production-ready code
- **Feature branches**: `feature/description` - new features
- **Fix branches**: `fix/description` - bug fixes
- **Commit convention**: Conventional Commits
  - `feat:` - new features
  - `fix:` - bug fixes
  - `refactor:` - code refactoring
  - `docs:` - documentation changes
  - `style:` - formatting changes
  - `test:` - test additions/changes
  - `chore:` - maintenance tasks

## Domain Context

### PocketBase Concepts
- **Collections**: Database tables with schema definitions
- **Records**: Individual entries in collections
- **Relations**: Foreign key relationships between collections
- **Rules**: Access control rules for collections (create, read, update, delete)
- **Hooks**: Server-side event handlers for collection operations
- **Admin API**: Special endpoints for administrative operations

### SvelteKit Concepts
- **Routes**: File-system based routing in `src/routes`
- **Load Functions**: Data fetching functions that run on the client
- **Client-side Navigation**: SPA routing without page reloads
- **Stores**: Reactive state management using Svelte stores
- **SPA Adapter**: `@sveltejs/adapter-static` for building static SPA output

## Important Constraints

### Technical Constraints
- PocketBase requires Go runtime (for self-hosting)
- PocketBase uses SQLite, which has certain limitations (e.g., concurrent writes)
- SvelteKit requires Bun runtime
- Browser compatibility: Modern browsers (ES2020+)
- PocketBase admin UI runs on separate port (default: 8090)

### Development Constraints
- PocketBase data directory must be persistent
- Environment variables needed for PocketBase URL/credentials
- CORS configuration required for local development
- File upload size limits defined by PocketBase settings

### Security Considerations
- Never expose PocketBase admin credentials in frontend code
- Store auth tokens securely in localStorage or sessionStorage
- Validate user input on client-side before sending to PocketBase
- Implement proper CORS policies in PocketBase
- Use PocketBase collection rules for authorization
- All business logic validation must happen on PocketBase backend

## External Dependencies

### Backend (PocketBase)
- PocketBase server (self-hosted or PocketHost)
- PocketBase SDK (`pocketbase` npm package)
- Database: SQLite (embedded in PocketBase)

### Frontend (SvelteKit)
- Bun runtime and package manager
- SvelteKit framework
- Vite build tool
- PocketBase JavaScript SDK for API communication

### Optional Services
- Email service (for PocketBase email auth)
- Storage provider (if using external file storage)
- Static hosting platform (Vercel, Netlify, Cloudflare Pages, etc. for SvelteKit SPA)
- PocketBase hosting (self-hosted server or PocketHost)

## Project Structure (Planned)

```
/
├── pocketbase/           # PocketBase instance
│   ├── pb_data/         # Database and files
│   └── pocketbase       # PocketBase executable
├── src/
│   ├── lib/
│   │   ├── components/  # Svelte components
│   │   ├── services/    # API service layer
│   │   ├── stores/      # Svelte stores
│   │   └── types/       # TypeScript types
│   ├── routes/          # SvelteKit routes
│   │   ├── +layout.svelte
│   │   └── +page.svelte
│   └── app.html         # HTML template
├── static/              # Static assets
├── tests/               # Test files
└── package.json         # Dependencies
```

## Getting Started

### Prerequisites
- Bun (v1.0+)
- PocketBase executable

### Initial Setup
1. Download PocketBase executable
2. Initialize SvelteKit project with SPA adapter
3. Install PocketBase SDK
4. Configure SvelteKit for SPA mode (adapter-static with fallback)
5. Configure environment variables
6. Start PocketBase server
7. Start SvelteKit dev server

### Environment Variables
```
VITE_POCKETBASE_URL=http://localhost:8090
PUBLIC_POCKETBASE_URL=http://localhost:8090
```
