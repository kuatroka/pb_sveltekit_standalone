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
      <p class="note">Note: Create users in PocketBase admin UI first (http://localhost:8090/_/)</p>
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
    <h3>Svelte 5 Runes Examples</h3>
    <div class="runes-info">
      <div class="rune">
        <h4>$state</h4>
        <p>Creates reactive state variables</p>
        <code>let count = $state(0)</code>
      </div>
      <div class="rune">
        <h4>$derived</h4>
        <p>Creates computed values</p>
        <code>let doubled = $derived(count * 2)</code>
      </div>
      <div class="rune">
        <h4>$effect</h4>
        <p>Runs side effects when dependencies change</p>
        <code>$effect(() => console.log(count))</code>
      </div>
    </div>
  </section>

  <section class="info">
    <h3>Environment Info</h3>
    <p><strong>PocketBase URL:</strong> {import.meta.env.VITE_POCKETBASE_URL}</p>
    <p><strong>Auth Status:</strong> {authStore.isAuthenticated ? 'Authenticated' : 'Not authenticated'}</p>
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
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  }

  section h3 {
    margin-top: 0;
    color: #333;
  }

  .note {
    padding: 0.75rem;
    background: #fff3cd;
    border: 1px solid #ffc107;
    border-radius: 4px;
    color: #856404;
    font-size: 0.9rem;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-width: 400px;
  }

  input {
    padding: 0.75rem;
    font-size: 1rem;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  input:focus {
    outline: none;
    border-color: #4CAF50;
  }

  button {
    padding: 0.75rem;
    font-size: 1rem;
    cursor: pointer;
    border: none;
    border-radius: 4px;
    background: #4CAF50;
    color: white;
    transition: background 0.2s;
  }

  button:hover:not(:disabled) {
    background: #45a049;
  }

  button:disabled {
    background: #ccc;
    cursor: not-allowed;
  }

  .error {
    color: #f44336;
    margin-top: 0.5rem;
    font-size: 0.9rem;
  }

  .info p {
    margin: 0.5rem 0;
    color: #666;
  }

  .runes-info {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
  }

  .rune {
    padding: 1rem;
    background: #f9f9f9;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
  }

  .rune h4 {
    margin: 0 0 0.5rem 0;
    color: #4CAF50;
  }

  .rune p {
    margin: 0 0 0.5rem 0;
    font-size: 0.9rem;
    color: #666;
  }

  .rune code {
    display: block;
    padding: 0.5rem;
    background: #2d2d2d;
    color: #f8f8f2;
    border-radius: 3px;
    font-size: 0.85rem;
    overflow-x: auto;
  }
</style>
