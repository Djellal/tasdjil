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
	import { Calendar, Plus, Pencil, Check, X, Trash2, CircleCheck, AlertCircle } from '@lucide/svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let editingRowId = $state<number | null>(null);

	const features = tableFeatures({
		rowSortingFeature,
		rowPaginationFeature,
		sortedRowModel: createSortedRowModel(),
		paginatedRowModel: createPaginatedRowModel(),
		sortFns
	});

	type Session = (typeof data.sessions)[number];

	const columns: ColumnDef<typeof features, Session>[] = [
		{
			accessorKey: 'nameSession',
			header: 'Session Name'
		},
		{
			accessorKey: 'startRegistrationsDate',
			header: 'Registration Start'
		},
		{
			accessorKey: 'endRegistrationsDate',
			header: 'Registration End'
		},
		{
			accessorKey: 'registrationOpened',
			header: 'Status'
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
			return data.sessions;
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

<svelte:head><title>Sessions | Tasdjil Admin</title></svelte:head>

<div class="admin-page">
	<header class="admin-page__header">
		<div>
			<h1><Calendar size={24} /> Sessions</h1>
			<p>Create and manage registration periods.</p>
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
		<h2>Add session</h2>
		<form class="entity-form entity-form--session" method="post" action="?/create" use:enhance>
			<label class="entity-form__field">
				Session name
				<input type="text" name="nameSession" autocomplete="off" required />
			</label>
			<label class="entity-form__field">
				Registration starts
				<input type="date" name="startRegistrationsDate" required />
			</label>
			<label class="entity-form__field">
				Registration ends
				<input type="date" name="endRegistrationsDate" required />
			</label>
			<label class="entity-form__field">
				Registration status
				<select name="registrationOpened" required>
					<option value="false">Closed</option>
					<option value="true">Open</option>
				</select>
			</label>
			<button type="submit"><Plus size={14} /> Add session</button>
		</form>
	</section>

	<section class="admin-panel">
		<h2>Existing sessions ({data.sessions.length})</h2>

		<DataTable {table} emptyMessage="No sessions have been added yet.">
			{#snippet children(row)}
				{@const session = row.original}
				<tr class:editing={editingRowId === session.id}>
					<td>
						{#if editingRowId === session.id}
							<input
								type="text"
								name="nameSession"
								value={session.nameSession}
								class="dt-input"
								required
							/>
						{:else}
							{session.nameSession}
						{/if}
					</td>
					<td>
						{#if editingRowId === session.id}
							<input
								type="date"
								name="startRegistrationsDate"
								value={session.startRegistrationsDate}
								class="dt-input"
								required
							/>
						{:else}
							{session.startRegistrationsDate}
						{/if}
					</td>
					<td>
						{#if editingRowId === session.id}
							<input
								type="date"
								name="endRegistrationsDate"
								value={session.endRegistrationsDate}
								class="dt-input"
								required
							/>
						{:else}
							{session.endRegistrationsDate}
						{/if}
					</td>
					<td>
						{#if editingRowId === session.id}
							<select name="registrationOpened" class="dt-select" required>
								<option value="false" selected={!session.registrationOpened}>Closed</option>
								<option value="true" selected={session.registrationOpened}>Open</option>
							</select>
						{:else}
							{session.registrationOpened ? 'Open' : 'Closed'}
						{/if}
					</td>
					<td>
						<div class="dt-actions">
							{#if editingRowId === session.id}
								<button
									type="button"
									class="dt-btn-save"
									onclick={(e) => handleSave(e, session.id)}
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
									onclick={() => (editingRowId = session.id)}
								>
									<Pencil size={12} /> Edit
								</button>
								<form method="post" action="?/delete" use:enhance style="display:inline">
									<input type="hidden" name="id" value={session.id} />
									<button
										type="submit"
										class="dt-btn-delete"
										aria-label="Delete {session.nameSession}"
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
