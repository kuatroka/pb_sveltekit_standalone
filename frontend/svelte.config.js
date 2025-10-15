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
      // Precompress files
      precompress: false,
      strict: true
    })
  },

  // Svelte 5 compiler options
  compilerOptions: {
    // Runes are enabled by default in Svelte 5
    runes: true
  }
};

export default config;
