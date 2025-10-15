<svelte:options runes={true} />

<script lang="ts">
	import { onMount } from 'svelte';
	import CounterControls from './components/CounterControls.svelte';
	import ChartGrid from './components/ChartGrid.svelte';
	import * as counterService from '$lib/services/counterService';
	import * as chartDataService from '$lib/services/chartDataService';
	import type { ChartSeries } from '$lib/services/chartDataService';

	// Local state using Svelte 5 runes
	let counter = $state(0);
	let loading = $state(false);
	let errorMessage = $state<string | null>(null);
	let chartSeries = $state<ChartSeries>({ labels: [], values: [] });
	let initialLoading = $state(true);

	// Fetch initial data on mount
	onMount(async () => {
		try {
			const [counterValue, chartData] = await Promise.all([
				counterService.getValue(),
				chartDataService.getChartSeries()
			]);
			counter = counterValue;
			chartSeries = chartData;
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : 'Failed to load data';
			console.error('Failed to load initial data:', error);
		} finally {
			initialLoading = false;
		}
	});

	/**
	 * Handle increment operation
	 * Updates counter optimistically and syncs with database
	 */
	async function handleIncrement() {
		if (loading) return;

		// Optimistic update
		const previousValue = counter;
		counter++;
		loading = true;
		errorMessage = null;

		try {
			// Sync with database
			const newValue = await counterService.increment();
			counter = newValue;
		} catch (error) {
			// Rollback on error
			counter = previousValue;
			errorMessage = error instanceof Error ? error.message : 'Failed to increment counter';
			console.error('Increment failed:', error);
		} finally {
			loading = false;
		}
	}

	/**
	 * Handle decrement operation
	 * Updates counter optimistically and syncs with database
	 */
	async function handleDecrement() {
		if (loading) return;

		// Optimistic update
		const previousValue = counter;
		counter--;
		loading = true;
		errorMessage = null;

		try {
			// Sync with database
			const newValue = await counterService.decrement();
			counter = newValue;
		} catch (error) {
			// Rollback on error
			counter = previousValue;
			errorMessage = error instanceof Error ? error.message : 'Failed to decrement counter';
			console.error('Decrement failed:', error);
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Counter with Charts - SvelteKit + PocketBase</title>
	<meta
		name="description"
		content="Interactive counter with database persistence and 10 chart visualizations"
	/>
</svelte:head>

<div class="counter-page">
	<div class="counter-shell">
		<!-- Page Header -->
		<div class="hero">
			<div class="breadcrumbs">
				<a href="/">Home</a>
				<span>›</span>
				<span>Counter</span>
			</div>
			<h1>Counter with Charts</h1>
			<p>
				Demonstrating full-stack integration with SvelteKit, PocketBase, and uPlot charting.
			</p>
		</div>

		<!-- Error Alert -->
		{#if errorMessage}
			<div class="error-banner">
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="error-icon">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
				<span class="error-text">{errorMessage}</span>
			</div>
		{/if}

		<!-- Counter Controls -->
		<div class="controls-region">
			<CounterControls
				{counter}
				{loading}
				onIncrement={handleIncrement}
				onDecrement={handleDecrement}
			/>
		</div>

		<!-- Charts Section -->
		<div class="charts-region">
			{#if initialLoading}
				<div class="loading-state">Loading charts...</div>
			{:else}
				<ChartGrid series={chartSeries} />
			{/if}
		</div>

		<!-- Technical Details Card -->
		<div class="tech-card">
			<h2>Technical Implementation</h2>
			<ul>
				<li><strong>Frontend:</strong> SvelteKit 5 with Svelte runes for reactive state management</li>
				<li><strong>Backend:</strong> PocketBase with SQLite database for persistence</li>
				<li><strong>Charts:</strong> uPlot library rendering 10 different visualization types</li>
				<li><strong>Styling:</strong> Tailwind CSS with DaisyUI-inspired custom theming</li>
			</ul>
		</div>
	</div>
</div>

<style>
	.counter-page {
		min-height: 100vh;
		background: linear-gradient(135deg, #f8fafc, #eef2ff);
		padding: 3rem 1.5rem 4rem;
		box-sizing: border-box;
	}

	.counter-shell {
		max-width: 1100px;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		gap: 2.5rem;
	}

	.hero {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.hero .breadcrumbs {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.95rem;
		color: rgba(71, 85, 105, 0.8);
	}

	.hero .breadcrumbs a {
		color: #2563eb;
		text-decoration: none;
		font-weight: 600;
	}

	.hero .breadcrumbs span:last-child {
		color: rgba(15, 23, 42, 0.9);
		font-weight: 600;
	}

	.hero h1 {
		margin: 0;
		font-size: clamp(2.2rem, 4vw, 2.75rem);
		font-weight: 800;
		color: #0f172a;
	}

	.hero p {
		margin: 0;
		max-width: 650px;
		line-height: 1.6;
		color: rgba(15, 23, 42, 0.7);
		font-size: 1.05rem;
	}

	.error-banner {
		display: flex;
		align-items: center;
		gap: 0.85rem;
		padding: 1rem 1.25rem;
		border-radius: 14px;
		background: rgba(248, 113, 113, 0.12);
		border: 1px solid rgba(239, 68, 68, 0.25);
		color: #991b1b;
		font-weight: 500;
	}

	.error-icon {
		min-width: 1.75rem;
		height: 1.75rem;
		color: inherit;
	}

	.error-text {
		line-height: 1.5;
	}

	.controls-region,
	.charts-region {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.tech-card {
		background: #ffffff;
		border-radius: 18px;
		box-shadow: 0 25px 45px -25px rgba(15, 23, 42, 0.35);
		border: 1px solid rgba(148, 163, 184, 0.2);
		padding: 2rem 2.25rem;
	}

	.tech-card h2 {
		margin: 0 0 1.25rem 0;
		font-size: 1.6rem;
		font-weight: 700;
		color: #0f172a;
	}

	.tech-card ul {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: 0.75rem;
	}

	.tech-card li {
		color: rgba(15, 23, 42, 0.75);
		line-height: 1.6;
		font-size: 0.98rem;
	}

	.tech-card strong {
		color: #0f172a;
	}

	.loading-state {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 3rem;
		color: rgba(15, 23, 42, 0.6);
		font-size: 1rem;
		font-weight: 500;
	}

	@media (max-width: 768px) {
		.counter-page {
			padding: 2.5rem 1.25rem 3rem;
		}

		.tech-card {
			padding: 1.75rem;
		}
	}
</style>
