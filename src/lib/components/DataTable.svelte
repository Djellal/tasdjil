<script lang="ts">
	/* eslint-disable @typescript-eslint/no-explicit-any */
	import { FlexRender } from '@tanstack/svelte-table';
	import type { Snippet } from 'svelte';
	import { ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from '@lucide/svelte';

	let {
		table,
		emptyMessage = 'No data found.',
		children
	}: {
		table: any;
		emptyMessage?: string;
		children: Snippet<[any]>;
	} = $props();
</script>

<div class="dt-wrapper">
	<table class="dt-table">
		<thead>
			{#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
				<tr>
					{#each headerGroup.headers as header (header.id)}
						<th>
							{#if header.isPlaceholder}
								&nbsp;
							{:else if header.column.getCanSort()}
								<button
									class="dt-sort-btn"
									type="button"
									onclick={header.column.getToggleSortingHandler()}
								>
									<FlexRender
										content={header.column.columnDef.header}
										context={header.getContext()}
									/>
								{#if header.column.getIsSorted() === 'asc'}
									<span class="dt-sort-icon"><ArrowUp size={14} /></span>
								{:else if header.column.getIsSorted() === 'desc'}
									<span class="dt-sort-icon"><ArrowDown size={14} /></span>
								{/if}
								</button>
							{:else}
								<FlexRender
									content={header.column.columnDef.header}
									context={header.getContext()}
								/>
							{/if}
						</th>
					{/each}
				</tr>
			{/each}
		</thead>
		<tbody>
			{#each table.getRowModel().rows as row (row.id)}
				{@render children(row)}
			{/each}
		</tbody>
	</table>

	{#if table.getRowModel().rows.length === 0}
		<p class="dt-empty">{emptyMessage}</p>
	{/if}

	{#if table.getPageCount() > 1}
		<div class="dt-pagination">
			<button
				type="button"
				class="dt-pagination__btn"
				disabled={!table.getCanPreviousPage()}
				onclick={() => table.previousPage()}
			>
				<ChevronLeft size={14} /> Previous
			</button>
			<span class="dt-pagination__info">
				Page {table.state.pagination.pageIndex + 1} of {table.getPageCount()}
			</span>
			<button
				type="button"
				class="dt-pagination__btn"
				disabled={!table.getCanNextPage()}
				onclick={() => table.nextPage()}
			>
				Next <ChevronRight size={14} />
			</button>
		</div>
	{/if}
</div>
