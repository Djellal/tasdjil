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
	import { Sparkles, Plus, Pencil, Check, X, Trash2, CircleCheck, AlertCircle } from '@lucide/svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let editingRowId = $state<number | null>(null);

	const features = tableFeatures({
		rowSortingFeature,
		rowPaginationFeature,
		sortedRowModel: createSortedRowModel(),
		paginatedRowModel: createPaginatedRowModel(),
		sortFns
	});

	type Speciality = (typeof data.specialities)[number];

	const columns: ColumnDef<typeof features, Speciality>[] = [
		{
			accessorKey: 'domaineName',
			header: 'Domaine'
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
			return data.specialities;
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

<svelte:head><title>Specialities | Tasdjil Admin</title></svelte:head>

<div class="admin-page">
	<header class="admin-page__header">
		<div>
			<h1><Sparkles size={24} /> Specialities</h1>
			<p>Create and manage specialities within each domaine.</p>
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

	<section class="admin-panel">
		<h2>Add speciality</h2>
		{#if data.domaines.length}
			<form class="entity-form entity-form--speciality" method="post" action="?/create" use:enhance>
				<label class="entity-form__field">
					Domaine
					<select name="domaineId" required>
						{#each data.domaines as savedDomaine (savedDomaine.id)}
							<option value={savedDomaine.id}>
								{savedDomaine.name} — {savedDomaine.studyLevel} — {savedDomaine.facultyName}
							</option>
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
				<button type="submit"><Plus size={14} /> Add speciality</button>
			</form>
		{:else}
			<p class="admin-panel__empty">Add a domaine before creating a speciality.</p>
		{/if}
	</section>

	<section class="admin-panel">
		<h2>Existing specialities ({data.specialities.length})</h2>

		<DataTable {table} emptyMessage="No specialities have been added yet.">
			{#snippet children(row)}
				{@const savedSpeciality = row.original}
				<tr class:editing={editingRowId === savedSpeciality.id}>
					<td>
						{#if editingRowId === savedSpeciality.id}
							<select name="domaineId" class="dt-select" required>
								{#each data.domaines as savedDomaine (savedDomaine.id)}
									<option
										value={savedDomaine.id}
										selected={savedSpeciality.domaineId === savedDomaine.id}
									>
										{savedDomaine.name} — {savedDomaine.studyLevel} — {savedDomaine.facultyName}
									</option>
								{/each}
							</select>
						{:else}
							{savedSpeciality.domaineName}
						{/if}
					</td>
					<td>
						{#if editingRowId === savedSpeciality.id}
							<input
								type="text"
								name="name"
								value={savedSpeciality.name}
								class="dt-input"
								required
							/>
						{:else}
							{savedSpeciality.name}
						{/if}
					</td>
					<td>
						{#if editingRowId === savedSpeciality.id}
							<input
								type="text"
								name="nameAr"
								value={savedSpeciality.nameAr}
								dir="rtl"
								class="dt-input"
								required
							/>
						{:else}
							{savedSpeciality.nameAr}
						{/if}
					</td>
					<td>
						<div class="dt-actions">
							{#if editingRowId === savedSpeciality.id}
								<button
									type="button"
									class="dt-btn-save"
									onclick={(e) => handleSave(e, savedSpeciality.id)}
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
									onclick={() => (editingRowId = savedSpeciality.id)}
								>
									<Pencil size={12} /> Edit
								</button>
								<form method="post" action="?/delete" use:enhance style="display:inline">
									<input type="hidden" name="id" value={savedSpeciality.id} />
									<button
										type="submit"
										class="dt-btn-delete"
										aria-label="Delete {savedSpeciality.name}"
									>
										<Trash2 size={12} /> Delete
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
