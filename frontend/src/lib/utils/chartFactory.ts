/**
 * Chart Factory for uPlot
 *
 * Provides configuration factories for 10 different chart types to visualize quarterly data.
 * Inspired by the Phoenix LiveView reference implementation, adapted for uPlot.
 */

import uPlot from 'uplot';

// Constants
const DEFAULT_HEIGHT = 360;
const DEFAULT_PADDING: uPlot.Padding = [16, 32, 48, 16];

const BAR_OPTIONS = {
	size: [0.6, Infinity] as [number, number],
	align: 0
};

/**
 * Chart configuration metadata
 */
export interface ChartMeta {
	key: string;
	title: string;
	description: string;
}

/**
 * Result of building a chart configuration
 */
export interface ChartBuildResult {
	series: uPlot.Series[];
	data: uPlot.AlignedData;
	extra?: {
		bands?: uPlot.Band[];
		scales?: Record<string, Partial<uPlot.Scale>>;
		axes?: uPlot.Axis[];
	};
}

/**
 * Chart configuration factory
 */
export interface ChartConfig {
	key: string;
	title: string;
	description: string;
	height?: number;
	build: (labels: string[], values: number[]) => ChartBuildResult;
}

/**
 * Creates base axes configuration for charts
 */
function baseAxes(labels: string[]): uPlot.Axis[] {
	return [
		{
			stroke: '#9ca3af',
			grid: { stroke: 'rgba(148, 163, 184, 0.2)' },
			ticks: { stroke: '#d1d5db' },
			values: (_: uPlot, ticks: number[]) => ticks.map(tick => labels[Math.round(tick)] ?? '')
		},
		{
			stroke: '#9ca3af',
			grid: { stroke: 'rgba(148, 163, 184, 0.2)' },
			ticks: { stroke: '#d1d5db' }
		}
	];
}

/**
 * Creates base uPlot options
 */
function makeBaseOptions(params: {
	title: string;
	labels: string[];
	width: number;
	height?: number;
}): uPlot.Options {
	return {
		title: params.title,
		width: Math.max(params.width, 600),
		height: params.height || DEFAULT_HEIGHT,
		padding: DEFAULT_PADDING,
		legend: { show: true },
		scales: {
			x: { time: false },
			y: {}
		},
		axes: baseAxes(params.labels),
		series: [{}] // X-axis series
	};
}

/**
 * Calculate cumulative sum
 */
function sum(values: number[]): number[] {
	let total = 0;
	return values.map(value => {
		total += value;
		return total;
	});
}

/**
 * Calculate moving average with given window size
 */
function movingAverage(values: number[], window = 3): number[] {
	return values.map((_, idx) => {
		const start = Math.max(0, idx - window + 1);
		const slice = values.slice(start, idx + 1);
		const avg = slice.reduce((acc, value) => acc + value, 0) / slice.length;
		return Number(avg.toFixed(2));
	});
}

/**
 * Convert labels to indices for uPlot x-axis
 */
export function labelsToIndices(labels: string[]): number[] {
	return labels.map((_, idx) => idx);
}

/**
 * Chart configuration factories
 */
const chartFactories: Record<string, ChartConfig> = {
	bars: {
		key: 'bars',
		title: 'Quarterly Values · Column',
		description: 'Baseline columnar view of raw quarterly values.',
		build(labels: string[], values: number[]): ChartBuildResult {
			return {
				series: [
					{
						label: 'Value',
						spanGaps: false,
						paths: uPlot.paths.bars!(BAR_OPTIONS),
						fill: 'rgba(37, 99, 235, 0.35)',
						stroke: '#2563eb',
						points: { show: false }
					}
				],
				data: [values]
			};
		}
	},

	line: {
		key: 'line',
		title: 'Quarterly Trend · Line',
		description: 'Simple line chart to highlight quarter-to-quarter momentum.',
		build(_labels: string[], values: number[]): ChartBuildResult {
			return {
				series: [
					{
						label: 'Value',
						stroke: '#2563eb',
						width: 2,
						points: { show: true, size: 8 }
					}
				],
				data: [values]
			};
		}
	},

	area: {
		key: 'area',
		title: 'Quarterly Total · Area',
		description: 'Line with a soft fill to emphasize magnitude across the quarters.',
		build(_labels: string[], values: number[]): ChartBuildResult {
			return {
				series: [
					{
						label: 'Value',
						stroke: '#7c3aed',
						width: 2,
						fill: 'rgba(124, 58, 237, 0.25)',
						points: { show: true, size: 6 }
					}
				],
				data: [values]
			};
		}
	},

	scatter: {
		key: 'scatter',
		title: 'Quarterly Distribution · Scatter',
		description: 'Points-only scatter plot showing distribution without connective lines.',
		build(_labels: string[], values: number[]): ChartBuildResult {
			return {
				series: [
					{
						label: 'Value',
						stroke: '#16a34a',
						width: 0,
						points: { show: true, size: 9 },
						paths: uPlot.paths.points!()
					}
				],
				data: [values]
			};
		}
	},

	step: {
		key: 'step',
		title: 'Quarterly Changes · Step',
		description: 'Step chart to underscore discrete quarter-to-quarter shifts.',
		build(_labels: string[], values: number[]): ChartBuildResult {
			return {
				series: [
					{
						label: 'Value',
						stroke: '#dc2626',
						width: 2,
						paths: uPlot.paths.stepped!({ align: 1 }),
						points: { show: true, size: 6 }
					}
				],
				data: [values]
			};
		}
	},

	spline: {
		key: 'spline',
		title: 'Quarterly Trend · Spline',
		description: 'Smoothed spline interpolation for a softer visual trajectory.',
		height: 320,
		build(_labels: string[], values: number[]): ChartBuildResult {
			return {
				series: [
					{
						label: 'Value',
						stroke: '#ea580c',
						width: 2,
						paths: uPlot.paths.spline!(),
						points: { show: false }
					}
				],
				data: [values]
			};
		}
	},

	cumulative: {
		key: 'cumulative',
		title: 'Cumulative Performance · Line',
		description: 'Running total layered over the raw quarterly values.',
		build(_labels: string[], values: number[]): ChartBuildResult {
			const cumulativeValues = sum(values);
			return {
				series: [
					{
						label: 'Quarterly',
						stroke: '#2563eb',
						width: 2,
						points: { show: true, size: 6 }
					},
					{
						label: 'Cumulative',
						stroke: '#0f766e',
						width: 2,
						dash: [10, 6],
						points: { show: true, size: 6 }
					}
				],
				data: [values, cumulativeValues]
			};
		}
	},

	'moving-average': {
		key: 'moving-average',
		title: 'Smoothed Trend · Moving Average',
		description: 'Three-quarter moving average contrasted against the actual values.',
		build(_labels: string[], values: number[]): ChartBuildResult {
			const averageValues = movingAverage(values, 3);
			return {
				series: [
					{
						label: 'Quarterly',
						stroke: '#1d4ed8',
						width: 2,
						points: { show: true, size: 6 }
					},
					{
						label: '3Q Moving Avg',
						stroke: '#9333ea',
						width: 2,
						dash: [6, 4],
						points: { show: false }
					}
				],
				data: [values, averageValues]
			};
		}
	},

	range: {
		key: 'range',
		title: 'Forecast Envelope · Range Band',
		description: 'Confidence-style envelope built from ±5 units around the actuals.',
		build(_labels: string[], values: number[]): ChartBuildResult {
			const lower = values.map(value => Math.max(0, Number((value - 5).toFixed(2))));
			const upper = values.map(value => Number((value + 5).toFixed(2)));
			return {
				series: [
					{
						label: 'Lower',
						stroke: 'transparent'
					},
					{
						label: 'Upper',
						stroke: 'transparent'
					},
					{
						label: 'Actual',
						stroke: '#2563eb',
						width: 2,
						points: { show: true, size: 6 }
					}
				],
				data: [lower, upper, values],
				extra: {
					bands: [
						{
							series: [1, 2],
							fill: 'rgba(59, 130, 246, 0.12)'
						}
					]
				}
			};
		}
	},

	delta: {
		key: 'delta',
		title: 'Quarter-over-Quarter Delta · Diverging Bars',
		description: 'Positive and negative changes separated to spotlight acceleration or slowdowns.',
		build(_labels: string[], values: number[]): ChartBuildResult {
			const gains = values.map((value, idx) => {
				if (idx === 0) return null;
				const delta = Number((value - values[idx - 1]).toFixed(2));
				return delta > 0 ? delta : null;
			});

			const losses = values.map((value, idx) => {
				if (idx === 0) return null;
				const delta = Number((value - values[idx - 1]).toFixed(2));
				return delta < 0 ? delta : null;
			});

			return {
				series: [
					{
						label: 'Gains',
						paths: uPlot.paths.bars!({
							align: 0,
							size: [0.4, Infinity]
						}),
						fill: 'rgba(22, 163, 74, 0.35)',
						stroke: '#16a34a'
					},
					{
						label: 'Losses',
						paths: uPlot.paths.bars!({
							align: 0,
							size: [0.4, Infinity]
						}),
						fill: 'rgba(220, 38, 38, 0.35)',
						stroke: '#dc2626'
					}
				],
				data: [gains, losses],
				extra: {
					scales: {
						y: {
							distr: 1
						}
					}
				}
			};
		}
	}
};

/**
 * Chart metadata list for rendering
 */
export const chartMetaList: ChartMeta[] = Object.values(chartFactories).map(config => ({
	key: config.key,
	title: config.title,
	description: config.description
}));

/**
 * Instantiate a uPlot chart
 */
function instantiateChart(
	kind: string,
	el: HTMLElement,
	labels: string[],
	values: number[],
	titleOverride?: string
): uPlot {
	// Handle empty data case
	if (labels.length === 0 || values.length === 0) {
		console.warn('Chart data is empty, using placeholder data');
		labels = ['Q1', 'Q2', 'Q3', 'Q4'];
		values = [0, 0, 0, 0];
	}

	const factory = chartFactories[kind] ?? chartFactories.bars;
	const width = el.clientWidth;
	const baseOptions = makeBaseOptions({
		title: titleOverride || factory.title,
		labels,
		width,
		height: factory.height || DEFAULT_HEIGHT
	});

	const { series, data, extra } = factory.build(labels, values);

	// Apply extra configuration
	if (extra?.bands) {
		baseOptions.bands = extra.bands;
	}
	if (extra?.scales) {
		baseOptions.scales = {
			...baseOptions.scales,
			...extra.scales
		};
	}
	if (extra?.axes) {
		baseOptions.axes = extra.axes;
	}

	// Add series to base options (skip first {} which is x-axis)
	baseOptions.series = [{}, ...series];

	// Prepare chart data
	const xValues = labelsToIndices(labels);
	const chartData: uPlot.AlignedData = [xValues, ...data];

	// Create uPlot instance
	const chart = new uPlot(baseOptions, chartData, el);

	// Store metadata for later use
	(chart as any).__quarter = {
		kind,
		height: baseOptions.height,
		factory
	};

	return chart;
}

/**
 * Rebuild chart data for updates
 */
function rebuildData(kind: string, labels: string[], values: number[]): uPlot.AlignedData {
	const factory = chartFactories[kind] ?? chartFactories.bars;
	const { data } = factory.build(labels, values);
	const xValues = labelsToIndices(labels);
	return [xValues, ...data];
}

/**
 * Create a quarter chart
 */
export function createQuarterChart(
	el: HTMLElement,
	labels: string[],
	values: number[],
	title = 'Quarterly Values',
	kind = 'bars'
): uPlot {
	return instantiateChart(kind, el, labels, values, title);
}

/**
 * Update chart data
 */
export function updateQuarterChart(
	chart: uPlot,
	labels: string[],
	values: number[],
	kind?: string
): void {
	const chartKind = kind ?? (chart as any).__quarter?.kind ?? 'bars';
	const data = rebuildData(chartKind, labels, values);
	chart.setData(data);
}

/**
 * Resize chart to fit container
 */
export function resizeQuarterChart(chart: uPlot, container: HTMLElement): void {
	if (!chart || !container) return;
	const config = (chart as any).__quarter || {};
	chart.setSize({
		width: Math.max(container.clientWidth, 600),
		height: config.height || DEFAULT_HEIGHT
	});
}
