/**
 * Chart Data Service
 *
 * Provides functions to interact with the PocketBase chart_data collection.
 * Fetches quarterly data for chart visualization.
 */

import pb from './pocketbase';

const COLLECTION = 'value_quarters';
const SETUP_HINT =
    'PocketBase collections are missing. Seed data with `go run ./pocketbase/seeders/valuequarters` after exporting PB_ADMIN_EMAIL and PB_ADMIN_PASSWORD.';

interface ChartDataRecord {
    id: string;
    quarter: string;
    value: number;
    created: string;
    updated: string;
}

export interface ChartSeries {
	labels: string[];
	values: number[];
}

/**
 * Parse quarter string to sortable format
 * E.g., "Q1 2023" -> 2023.1
 */
function quarterToSortKey(quarter: string): number {
    const match = quarter.match(/(\d{4})Q([1-4])/);
    if (!match) return 0;
    const year = parseInt(match[1], 10);
    const q = parseInt(match[2], 10);
    return year * 10 + q;
}

function formatQuarterLabel(quarter: string): string {
    const match = quarter.match(/(\d{4})Q([1-4])/);
    if (!match) return quarter;
    const year = match[1];
    const q = match[2];
    return `Q${q} ${year}`;
}

/**
 * Get chart data formatted for chart rendering
 *
 * Fetches all chart_data records and transforms them into
 * a format suitable for uPlot charts: {labels: [...], values: [...]}
 *
 * @returns Promise resolving to chart series data
 * @throws Error if the operation fails
 */
export async function getChartSeries(): Promise<ChartSeries> {
	try {
		// Fetch all chart data records
		const response = await pb.collection(COLLECTION).getList<ChartDataRecord>(1, 200, {
			sort: 'quarter',
			skipTotal: true
		});

		const records = response.items;

		if (records.length === 0) {
			return { labels: [], values: [] };
		}

		// Records are already sorted by quarter from the API, but we'll re-sort for consistency
		const sorted = records.sort((a, b) => {
			return quarterToSortKey(a.quarter) - quarterToSortKey(b.quarter);
		});

		// Extract labels and values
        const labels = sorted.map(record => formatQuarterLabel(record.quarter));
		const values = sorted.map(record => record.value);

		return { labels, values };
    } catch (error: any) {
        if (isNotFoundError(error)) {
            throw new Error(SETUP_HINT);
        }
        throw new Error(`Failed to fetch chart data: ${error.message || error}`);
    }
}

/**
 * Refresh chart data (alias for getChartSeries for clarity)
 *
 * @returns Promise resolving to fresh chart series data
 */
export async function refreshChartData(): Promise<ChartSeries> {
    return getChartSeries();
}

function isNotFoundError(error: any): boolean {
    if (!error) return false;
    if (typeof error.status === 'number' && error.status === 404) return true;
    const message =
        (typeof error.message === 'string' && error.message) ||
        (typeof error.response === 'object' && error.response?.message) ||
        (typeof error.data === 'object' && (error.data?.message as string)) ||
        '';
    return typeof message === 'string' && message.includes("wasn't found");
}
