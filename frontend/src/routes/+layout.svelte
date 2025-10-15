<script lang="ts">
  import '../app.css';
  import { authStore } from '$lib/stores/auth.svelte';
  import { page } from '$app/stores';

  // Svelte 5: children prop is automatically passed
  let { children } = $props();

  // Check if a route is active
  function isActive(pathname: string): boolean {
    return $page.url.pathname === pathname;
  }
</script>

<div class="app">
  <header>
    <div class="header-content">
      <h1>PocketBase + SvelteKit App</h1>
      <nav class="nav-menu">
        <a href="/" class:active={isActive('/')}>Home</a>
        <a href="/counter" class:active={isActive('/counter')}>Counter</a>
      </nav>
    </div>
    <div class="auth-status">
      {#if authStore.isAuthenticated}
        <p>Logged in as: <strong>{authStore.user?.email}</strong></p>
        <button onclick={() => authStore.logout()}>Logout</button>
      {:else}
        <p>Not logged in</p>
      {/if}
    </div>
  </header>

  <main>
    {@render children()}
  </main>

  <footer>
    <p>Built with PocketBase, SvelteKit, and Svelte 5 runes</p>
    <p class="env-info">PocketBase URL: {import.meta.env.VITE_POCKETBASE_URL || 'http://localhost:8090'}</p>
  </footer>
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: system-ui, -apple-system, sans-serif;
    background: #f5f5f5;
  }

  .app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  header {
    padding: 1rem 2rem;
    background: white;
    border-bottom: 2px solid #e0e0e0;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  header h1 {
    margin: 0;
    color: #333;
  }

  .nav-menu {
    display: flex;
    gap: 1rem;
  }

  .nav-menu a {
    padding: 0.5rem 1rem;
    text-decoration: none;
    color: #666;
    border-radius: 4px;
    transition: background 0.2s, color 0.2s;
  }

  .nav-menu a:hover {
    background: #f0f0f0;
    color: #333;
  }

  .nav-menu a.active {
    background: #2196F3;
    color: white;
  }

  .auth-status {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .auth-status p {
    margin: 0;
    color: #666;
  }

  .auth-status button {
    padding: 0.5rem 1rem;
    background: #f44336;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
  }

  .auth-status button:hover {
    background: #d32f2f;
  }

  main {
    flex: 1;
    padding: 2rem;
    max-width: 1200px;
    width: 100%;
    margin: 0 auto;
    box-sizing: border-box;
  }

  footer {
    padding: 1rem;
    background: white;
    border-top: 2px solid #e0e0e0;
    text-align: center;
    color: #666;
  }

  footer p {
    margin: 0.25rem 0;
  }

  .env-info {
    font-size: 0.85rem;
    color: #999;
  }
</style>
