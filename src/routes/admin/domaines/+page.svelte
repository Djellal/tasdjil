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

	type Domaine = (typeof data.domaines)[number];

	const columns: ColumnDef<typeof features, Domaine>[] = [
		{
			accessorKey: 'facultyName',
			header: 'Faculty'
		},
		{
			accessorKey: 'studyLevel',
			header: 'Study Level'
		},
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
			return data.domaines;
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

<svelte:head><title>Domaines | Tasdjil Admin</title></svelte:head>

<div class="admin-page">
	<header class="admin-page__header">
		<div>
			<h1>Domaines</h1>
			<p>Manage domaines by faculty and study level.</p>
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
		<h2>Add domaine</h2>
		{#if data.faculties.length}
			<form class="entity-form entity-form--domaine" method="post" action="?/create" use:enhance>
				<label class="entity-form__field">
					Faculty
					<select name="facultyId" required>
						{#each data.faculties as faculty (faculty.id)}
							<option value={faculty.id}>{faculty.name}</option>
						{/each}
					</select>
				</label>
				<label class="entity-form__field">
					Study level
					<select name="studyLevel" required>
						{#each data.studyLevels as level (level)}
							<option value={level}>{level}</option>
						{/each}
					</select>
				</label>
				<label class="entity-form__field">
					Name
					<input type="text" name="name" autocomplete="off" required />
				</label>
				<label class="entity-form__field">
					Arabic name
					<input type="text" name="nameAr" dir="rtl" autocomplete="off" required />
				</label>
				<button type="submit">Add domaine</button>
			</form>
		{:else}
			<p class="admin-panel__empty">Add a faculty before creating a domaine.</p>
		{/if}
	</section>

	<section class="admin-panel">
		<h2>Existing domaines ({data.domaines.length})</h2>

		<DataTable {table} emptyMessage="No domaines have been added yet.">
			{#snippet children(row)}
				{@const savedDomaine = row.original}
				<tr class:editing={editingRowId === savedDomaine.id}>
					<td>
						{#if editingRowId === savedDomaine.id}
							<select name="facultyId" class="dt-select" required>
								{#each data.faculties as faculty (faculty.id)}
									<option value={faculty.id} selected={savedDomaine.facultyId === faculty.id}>
										{faculty.name}
									</option>
								{/each}
							</select>
						{:else}
							{savedDomaine.facultyName}
						{/if}
					</td>
					<td>
						{#if editingRowId === savedDomaine.id}
							<select name="studyLevel" class="dt-select" required>
								{#each data.studyLevels as level (level)}
									<option value={level} selected={savedDomaine.studyLevel === level}>
										{level}
									</option>
								{/each}
							</select>
						{:else}
							{savedDomaine.studyLevel}
						{/if}
					</td>
					<td>
						{#if editingRowId === savedDomaine.id}
							<input type="text" name="name" value={savedDomaine.name} class="dt-input" required />
						{:else}
							{savedDomaine.name}
						{/if}
					</td>
					<td>
						{#if editingRowId === savedDomaine.id}
							<input
								type="text"
								name="nameAr"
								value={savedDomaine.nameAr}
								dir="rtl"
								class="dt-input"
								required
							/>
						{:else}
							{savedDomaine.nameAr}
						{/if}
					</td>
					<td>
						<div class="dt-actions">
							{#if editingRowId === savedDomaine.id}
								<button
									type="button"
									class="dt-btn-save"
									onclick={(e) => handleSave(e, savedDomaine.id)}
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
									onclick={() => (editingRowId = savedDomaine.id)}
								>
									Edit
								</button>
								<form method="post" action="?/delete" use:enhance style="display:inline">
									<input type="hidden" name="id" value={savedDomaine.id} />
									<button
										type="submit"
										class="dt-btn-delete"
										aria-label="Delete {savedDomaine.name}"
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
