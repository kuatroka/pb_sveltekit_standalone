# Use official Bun image (pinned version for reproducibility)
FROM oven/bun:1.3-alpine


# Set working directory
WORKDIR /app

# Copy package files for dependency installation
# Use wildcard for bun.lockb to handle cases where it doesn't exist yet
COPY package.json bun.lockb* ./

# Install dependencies
# --frozen-lockfile ensures reproducible installs
RUN bun install --frozen-lockfile || bun install

# Copy source code
# Note: In development, this will be overridden by volume mount
COPY . .

# Expose Vite dev server port
EXPOSE 5173

# Start development server
# Run svelte-kit sync first to generate .svelte-kit/tsconfig.json
# --host 0.0.0.0 makes it accessible from outside container
CMD ["sh", "-c", "bunx svelte-kit sync && bun run dev --host 0.0.0.0"]
