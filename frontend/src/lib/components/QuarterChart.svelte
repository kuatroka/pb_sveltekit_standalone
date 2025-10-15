<svelte:options runes={true} />

<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type uPlot from 'uplot';
	import 'uplot/dist/uPlot.min.css';
	import {
		createQuarterChart,
		updateQuarterChart,
		resizeQuarterChart
	} from '$lib/utils/chartFactory';

	interface ChartSeries {
		labels: string[];
		values: number[];
	}

	// Component props using Svelte 5 runes
	let { chartKey, series = { labels: [], values: [] }, title }: {
		chartKey: string;
		series?: ChartSeries;
		title?: string;
	} = $props();

	// State
	let container: HTMLElement;
	let chart: uPlot | null = null;
	let handleResize: (() => void) | null = null;

	/**
	 * Normalize series data to handle null/undefined
	 */
	function normalizeSeries(data: ChartSeries = series): ChartSeries {
		const safe = data ?? { labels: [], values: [] };
		return {
			labels: safe.labels ?? [],
			values: safe.values ?? []
		};
	}

	/**
	 * Debounce function for resize handler
	 */
	function debounce<T extends (...args: any[]) => void>(func: T, wait: number): T {
		let timeout: ReturnType<typeof setTimeout> | null = null;
		return ((...args: any[]) => {
			if (timeout) clearTimeout(timeout);
			timeout = setTimeout(() => func(...args), wait);
		}) as T;
	}

	onMount(() => {
		const { labels, values } = normalizeSeries();
		chart = createQuarterChart(
			container,
			labels,
			values,
			title ?? 'Quarterly Values',
			chartKey
		);

		// Create debounced resize handler
		handleResize = debounce(() => {
			if (chart && container) {
				resizeQuarterChart(chart, container);
			}
		}, 150);

		window.addEventListener('resize', handleResize);
		resizeQuarterChart(chart, container);
	});

	// Use $effect to watch for series changes (replaces afterUpdate in runes mode)
	$effect(() => {
		if (chart && series) {
			const { labels, values } = normalizeSeries();
			updateQuarterChart(chart, labels, values, chartKey);
		}
	});

	onDestroy(() => {
		if (handleResize) {
			window.removeEventListener('resize', handleResize);
		}
		chart?.destroy();
		chart = null;
	});
</script>

<div class="w-full overflow-x-auto" bind:this={container}></div>
