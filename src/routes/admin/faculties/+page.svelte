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
	import { School, Plus, Pencil, Check, X, Trash2, CircleCheck, AlertCircle } from '@lucide/svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let editingRowId = $state<number | null>(null);

	const features = tableFeatures({
		rowSortingFeature,
		rowPaginationFeature,
		sortedRowModel: createSortedRowModel(),
		paginatedRowModel: createPaginatedRowModel(),
		sortFns
	});

	type Faculty = (typeof data.faculties)[number];

	const columns: ColumnDef<typeof features, Faculty>[] = [
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
			return data.faculties;
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

<svelte:head><title>Faculties | Tasdjil Admin</title></svelte:head>

<div class="admin-page">
	<header class="admin-page__header">
		<div>
			<h1><School size={24} /> Faculties</h1>
			<p>
				{data.isAdmin
					? 'Create and manage faculty names in French and Arabic.'
					: 'View and edit your faculty information.'}
			</p>
		</div>
	</header>

	{#if form?.message}
		<p
			class:admin-alert--success={form.success}
			class:admin-alert--error={!form.success}
			class="admin-alert"
			role="status"
		>
			{#if form.success}<CircleCheck size={16} />{:else}<AlertCircle size={16} />{/if}
			{form.message}
		</p>
	{/if}

	{#if data.isAdmin}
		<section class="admin-panel">
			<h2>Add faculty</h2>
			<form class="faculty-form" method="post" action="?/create" use:enhance>
				<label class="faculty-form__field">
					Name
					<input type="text" name="name" autocomplete="off" required />
				</label>
				<label class="faculty-form__field">
					Arabic name
					<input type="text" name="nameAr" dir="rtl" autocomplete="off" required />
				</label>
				<button type="submit"><Plus size={14} /> Add faculty</button>
			</form>
		</section>
	{/if}

	<section class="admin-panel">
		<h2>{data.isAdmin ? 'Existing faculties' : 'Your faculty'} ({data.faculties.length})</h2>

		<DataTable
			{table}
			emptyMessage={data.isAdmin ? 'No faculties have been added yet.' : 'No faculty found.'}
		>
			{#snippet children(row)}
				{@const faculty = row.original}
				<tr class:editing={editingRowId === faculty.id}>
					<td>
						{#if editingRowId === faculty.id}
							<input type="text" name="name" value={faculty.name} class="dt-input" required />
						{:else}
							{faculty.name}
						{/if}
					</td>
					<td>
						{#if editingRowId === faculty.id}
							<input
								type="text"
								name="nameAr"
								value={faculty.nameAr}
								dir="rtl"
								class="dt-input"
								required
							/>
						{:else}
							{faculty.nameAr}
						{/if}
					</td>
					<td>
						<div class="dt-actions">
							{#if editingRowId === faculty.id}
								<button
									type="button"
									class="dt-btn-save"
									onclick={(e) => handleSave(e, faculty.id)}
								>
									<Check size={12} /> Save
								</button>
								<button type="button" class="dt-btn-cancel" onclick={() => (editingRowId = null)}>
									<X size={12} /> Cancel
								</button>
							{:else}
								<button
									type="button"
									class="dt-btn-edit"
									onclick={() => (editingRowId = faculty.id)}
								>
									<Pencil size={12} /> Edit
								</button>
								{#if data.isAdmin}
									<form method="post" action="?/delete" use:enhance style="display:inline">
										<input type="hidden" name="id" value={faculty.id} />
										<button type="submit" class="dt-btn-delete" aria-label="Delete {faculty.name}">
											<Trash2 size={12} /> Delete
										</button>
									</form>
								{/if}
							{/if}
						</div>
					</td>
				</tr>
			{/snippet}
		</DataTable>
	</section>
</div>
