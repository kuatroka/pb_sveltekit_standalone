<script lang="ts">
  // Svelte 5 runes syntax demonstration

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
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    background: #fafafa;
  }

  .message {
    font-size: 1.2rem;
    margin-bottom: 1rem;
    color: #333;
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
    color: #4CAF50;
  }

  button {
    padding: 0.5rem 1rem;
    font-size: 1rem;
    cursor: pointer;
    border: 1px solid #ccc;
    border-radius: 4px;
    background: white;
    transition: background 0.2s;
  }

  button:hover {
    background: #f0f0f0;
  }

  .reset {
    margin-top: 1rem;
    background: #2196F3;
    color: white;
    border-color: #2196F3;
  }

  .reset:hover {
    background: #1976D2;
  }

  .derived {
    color: #666;
    font-style: italic;
    margin-top: 1rem;
  }
</style>
