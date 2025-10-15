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
      // Use polling for better compatibility with Docker volumes
      usePolling: true,
      interval: 100
    }
  }
});
