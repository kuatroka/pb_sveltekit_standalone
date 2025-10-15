/**
 * Counter Service
 *
 * Provides functions to interact with the PocketBase counters collection.
 * Handles counter value retrieval, increment, and decrement operations.
 */

import pb from './pocketbase';

const COLLECTION = 'counters';
const COUNTER_ID = 'main';
const SETUP_HINT =
	'PocketBase collections are missing. Run `docker compose down -v && docker compose up --build pocketbase` to reapply migrations.';

interface CounterRecord {
	id: string;
	value: number;
	updated: string;
}

// Store the counter ID once we find/create it
let counterIdCache: string | null = COUNTER_ID;

/**
 * Get or create a counter record
 * @returns Promise resolving to the counter record
 */
async function getOrCreateCounter(): Promise<CounterRecord> {
	const targetId = counterIdCache ?? COUNTER_ID;
	try {
		const record = await pb.collection(COLLECTION).getOne<CounterRecord>(targetId);
		counterIdCache = record.id;
		return record;
	} catch (error: any) {
		if (isNotFoundError(error)) {
			const newRecord = await pb.collection(COLLECTION).create<CounterRecord>({
				id: COUNTER_ID,
				value: 0
			});
			counterIdCache = newRecord.id;
			return newRecord;
		}
		throw new Error(`Failed to get or create counter: ${error.message || error}`);
	}
}

/**
 * Get the current counter value
 * If the counter doesn't exist, creates it with value 0
 *
 * @returns Promise resolving to the current counter value
 * @throws Error if the operation fails
 */
export async function getValue(): Promise<number> {
	try {
		const counter = await getOrCreateCounter();
		return counter.value;
    } catch (error: any) {
        if (error instanceof Error && error.message === SETUP_HINT) {
            throw error;
        }
        if (isNotFoundError(error)) {
            throw new Error(SETUP_HINT);
        }
        throw new Error(`Failed to get counter value: ${error.message || error}`);
    }
}

/**
 * Increment the counter by 1
 *
 * @returns Promise resolving to the new counter value
 * @throws Error if the operation fails
 */
export async function increment(): Promise<number> {
	try {
		const counter = await getOrCreateCounter();
		const updated = await pb.collection(COLLECTION).update<CounterRecord>(counter.id, {
			value: counter.value + 1
		});
		return updated.value;
    } catch (error: any) {
        if (error instanceof Error && error.message === SETUP_HINT) {
            throw error;
        }
        if (isNotFoundError(error)) {
            throw new Error(SETUP_HINT);
        }
        throw new Error(`Failed to increment counter: ${error.message || error}`);
    }
}

/**
 * Decrement the counter by 1
 *
 * @returns Promise resolving to the new counter value
 * @throws Error if the operation fails
 */
export async function decrement(): Promise<number> {
	try {
		const counter = await getOrCreateCounter();
		const updated = await pb.collection(COLLECTION).update<CounterRecord>(counter.id, {
			value: counter.value - 1
		});
		return updated.value;
    } catch (error: any) {
        if (error instanceof Error && error.message === SETUP_HINT) {
            throw error;
        }
        if (isNotFoundError(error)) {
            throw new Error(SETUP_HINT);
        }
        throw new Error(`Failed to decrement counter: ${error.message || error}`);
    }
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
