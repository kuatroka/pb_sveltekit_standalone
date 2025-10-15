<svelte:options runes={true} />

<script lang="ts">
	let {
		counter = 0,
		onIncrement,
		onDecrement,
		loading = false
	}: {
		counter?: number;
		onIncrement?: () => void | Promise<void>;
		onDecrement?: () => void | Promise<void>;
		loading?: boolean;
	} = $props();
</script>

<div class="flex flex-col gap-4">
	<div class="rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-lg shadow-slate-900/5 backdrop-blur">
		<div class="flex flex-col gap-4 text-slate-700">
			<div class="flex items-center justify-between gap-2">
				<h2 class="text-xl font-semibold text-slate-900">Interactive Counter</h2>
				<span class="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-600">PocketBase synced</span>
			</div>
			<p class="text-sm leading-relaxed text-slate-600">
				Powered by PocketBase for persistence. The counter value syncs with the database on every update.
			</p>
			<div class="flex flex-col items-center gap-2 py-2">
				<p class="text-xs font-medium uppercase tracking-[0.25em] text-slate-500">Current count</p>
				<p class="text-5xl font-bold text-blue-600 drop-shadow-sm">{counter}</p>
			</div>
			<div class="flex flex-wrap items-center justify-center gap-3">
				<button
					type="button"
					class="inline-flex min-w-[140px] items-center justify-center rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-300"
					onclick={onIncrement}
					disabled={loading}
					aria-label="Increment counter"
				>
					Increment
				</button>
				<button
					type="button"
					class="inline-flex min-w-[140px] items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
					onclick={onDecrement}
					disabled={loading}
					aria-label="Decrement counter"
				>
					Decrement
				</button>
			</div>
		</div>
	</div>

	<div class="flex items-start gap-3 rounded-2xl border border-sky-100 bg-sky-50/80 p-4 text-sm text-sky-800 shadow-sm">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="1.8"
			class="h-5 w-5 flex-shrink-0"
		>
			<circle cx="12" cy="12" r="10" class="opacity-30" />
			<path stroke-linecap="round" stroke-linejoin="round" d="M12 8v5l3 1" />
		</svg>
		<p>
			This counter is stored in PocketBase. Refresh the page or open it in another tab to watch the value stay in sync.
		</p>
	</div>
</div>
