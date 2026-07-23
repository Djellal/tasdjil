<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { deserialize } from '$app/forms';
	import {
		createTable,
		tableFeatures,
		rowSortingFeature,
		rowPaginationFeature
	} from '@tanstack/svelte-table';
	import { createSortedRowModel, createPaginatedRowModel, sortFns } from '@tanstack/table-core';
	import type { ColumnDef } from '@tanstack/table-core';
	import DataTable from '$lib/components/DataTable.svelte';
	import '$lib/components/data-table.css';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let editingRowId = $state<number | null>(null);

	const features = tableFeatures({
		rowSortingFeature,
		rowPaginationFeature,
		sortedRowModel: createSortedRowModel(),
		paginatedRowModel: createPaginatedRowModel(),
		sortFns
	});

	type Establishment = (typeof data.establishments)[number];

	const columns: ColumnDef<typeof features, Establishment>[] = [
		{
			accessorKey: 'name',
			header: 'Name'
		},
		{
			accessorKey: 'nameAr',
			header: 'Arabic Name'
		},
		{
			id: 'actions',
			header: 'Actions',
			enableSorting: false
		}
	];

	const table = createTable({
		features,
		columns,
		get data() {
			return data.establishments;
		},
		initialState: {
			pagination: {
				pageIndex: 0,
				pageSize: 20
			}
		}
	});

	async function handleSave(event: Event, rowId: number) {
		const button = event.currentTarget as HTMLButtonElement;
		const tr = button.closest('tr');
		if (!tr) return;

		const formData = new FormData();
		formData.append('id', String(rowId));

		tr.querySelectorAll('input[name], select[name]').forEach((el) => {
			const input = el as HTMLInputElement | HTMLSelectElement;
			formData.set(input.name, input.value);
		});

		const response = await fetch('?/update', {
			method: 'POST',
			body: formData
		});
		const result = deserialize(await response.text());

		if (result.type === 'success') {
			editingRowId = null;
		}

		await invalidateAll();
	}
</script>

<svelte:head><title>Establishments | Tasdjil Admin</title></svelte:head>

<div class="admin-page">
	<header class="admin-page__header">
		<div>
			<h1>Establishments</h1>
			<p>Create and manage establishment names in French and Arabic.</p>
		</div>
	</header>

	{#if form?.message}
		<p
			class:admin-alert--success={form.success}
			class:admin-alert--error={!form.success}
			class="admin-alert"
			role="status"
		>
			{form.message}
		</p>
	{/if}

	<section class="admin-panel">
		<h2>Add establishment</h2>
		<form class="faculty-form" method="post" action="?/create" use:enhance>
			<label class="faculty-form__field">
				Name
				<input type="text" name="name" autocomplete="off" required />
			</label>
			<label class="faculty-form__field">
				Arabic name
				<input type="text" name="nameAr" dir="rtl" autocomplete="off" required />
			</label>
			<button type="submit">Add establishment</button>
		</form>
	</section>

	<section class="admin-panel">
		<h2>Existing establishments ({data.establishments.length})</h2>

		<DataTable {table} emptyMessage="No establishments have been added yet.">
			{#snippet children(row)}
				{@const establishment = row.original}
				<tr class:editing={editingRowId === establishment.id}>
					<td>
						{#if editingRowId === establishment.id}
							<input type="text" name="name" value={establishment.name} class="dt-input" required />
						{:else}
							{establishment.name}
						{/if}
					</td>
					<td>
						{#if editingRowId === establishment.id}
							<input
								type="text"
								name="nameAr"
								value={establishment.nameAr}
								dir="rtl"
								class="dt-input"
								required
							/>
						{:else}
							{establishment.nameAr}
						{/if}
					</td>
					<td>
						<div class="dt-actions">
							{#if editingRowId === establishment.id}
								<button
									type="button"
									class="dt-btn-save"
									onclick={(e) => handleSave(e, establishment.id)}
								>
									Save
								</button>
								<button type="button" class="dt-btn-cancel" onclick={() => (editingRowId = null)}>
									Cancel
								</button>
							{:else}
								<button
									type="button"
									class="dt-btn-edit"
									onclick={() => (editingRowId = establishment.id)}
								>
									Edit
								</button>
								<form method="post" action="?/delete" use:enhance style="display:inline">
									<input type="hidden" name="id" value={establishment.id} />
									<button
										type="submit"
										class="dt-btn-delete"
										aria-label="Delete {establishment.name}"
									>
										Delete
									</button>
								</form>
							{/if}
						</div>
					</td>
				</tr>
			{/snippet}
		</DataTable>
	</section>
</div>
