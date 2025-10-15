<svelte:options runes={true} />

<script lang="ts">
	import { onMount } from 'svelte';
import { chartMetaList } from '$lib/utils/chartFactory';
	let QuarterChart = $state<typeof import('$lib/components/QuarterChart.svelte').default | null>(null);

	// Dynamically import the heavy chart component only on client after mount
	onMount(async () => {
		const mod = await import('$lib/components/QuarterChart.svelte');
		QuarterChart = mod.default;
	});
	
	interface ChartSeries {
		labels: string[];
		values: number[];
	}

	// Component props
	let { series }: { series: ChartSeries } = $props();

	// Get primary chart (bars) and additional charts
	const primaryChart = chartMetaList.find(meta => meta.key === 'bars');
	const additionalCharts = chartMetaList.filter(meta => meta.key !== 'bars');
</script>

<div class="chart-grid">
	<!-- Primary Chart (Full Width) -->
	{#if primaryChart}
		<div class="card">
			<div class="card-body">
				<h2 class="card-title">{primaryChart.title}</h2>
				<p class="card-description">
					{primaryChart.description}
				</p>
				{#if QuarterChart}
				<svelte:component this={QuarterChart} chartKey={primaryChart.key} {series} title={primaryChart.title} />
			{/if}
			</div>
		</div>
	{/if}

	<!-- Additional Charts Grid -->
	<div class="card">
		<div class="card-body">
			<h2 class="card-title">Advanced Quarterly Visualizations</h2>
			<p class="card-description">
				Nine additional perspectives using the exact same quarterly dataset.
			</p>
			<div class="visual-grid">
				{#each additionalCharts as config (config.key)}
					<div class="visual-card">
						<div class="visual-card-header">
							<h3>{config.title}</h3>
							<p>{config.description}</p>
						</div>
						{#if QuarterChart}
							<svelte:component this={QuarterChart} chartKey={config.key} {series} title={config.title} />
						{/if}
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>

<style>
	.chart-grid > * + * {
		margin-top: 2rem;
	}

	.card {
		background: #ffffff;
		border-radius: 18px;
		box-shadow: 0 25px 45px -25px rgba(15, 23, 42, 0.35);
		border: 1px solid rgba(148, 163, 184, 0.2);
		overflow: hidden;
	}

	.card-body {
		padding: 2rem;
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.card-title {
		font-size: 1.5rem;
		font-weight: 700;
		margin: 0;
		color: #1f2937;
	}

	.card-description {
		margin: 0;
		color: rgba(51, 65, 85, 0.75);
		font-size: 0.95rem;
		line-height: 1.6;
	}

	.visual-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
		gap: 1.5rem;
	}

	.visual-card {
		border-radius: 16px;
		background: #f8fafc;
		border: 1px solid rgba(148, 163, 184, 0.2);
		padding: 1.25rem;
		box-shadow: 0 15px 35px -25px rgba(15, 23, 42, 0.35);
		transition: transform 0.2s ease, box-shadow 0.2s ease;
	}

	.visual-card:hover {
		transform: translateY(-3px);
		box-shadow: 0 30px 45px -30px rgba(15, 23, 42, 0.5);
	}

	.visual-card-header {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		margin-bottom: 0.85rem;
	}

	.visual-card-header h3 {
		margin: 0;
		font-size: 1.1rem;
		font-weight: 600;
		color: #1f2937;
	}

	.visual-card-header p {
		margin: 0;
		font-size: 0.9rem;
		color: rgba(51, 65, 85, 0.75);
	}
</style>
