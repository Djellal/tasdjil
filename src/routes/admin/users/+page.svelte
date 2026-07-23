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
	import { Users, Filter, Plus, Pencil, Check, X, Trash2, CircleCheck, AlertCircle } from '@lucide/svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let searchValue = $state(data.search);
	let roleValue = $state(data.role);
	let editingRowId = $state<string | null>(null);

	$effect(() => {
		searchValue = data.search;
		roleValue = data.role;
	});

	const features = tableFeatures({
		rowSortingFeature,
		rowPaginationFeature,
		sortedRowModel: createSortedRowModel(),
		paginatedRowModel: createPaginatedRowModel(),
		sortFns
	});

	type SavedUser = (typeof data.users)[number];

	const columns: ColumnDef<typeof features, SavedUser>[] = [
		{
			accessorKey: 'name',
			header: 'Name'
		},
		{
			accessorKey: 'email',
			header: 'Email'
		},
		{
			accessorKey: 'role',
			header: 'Role'
		},
		{
			id: 'facultyName',
			header: 'Faculty',
			accessorFn: (row) => {
				const faculty = data.faculties.find((f) => f.id === row.facultyId);
				return faculty ? faculty.name : '';
			}
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
			return data.users;
		},
		initialState: {
			pagination: {
				pageIndex: 0,
				pageSize: 20
			}
		}
	});

	async function handleSave(event: Event, rowId: string) {
		const button = event.currentTarget as HTMLButtonElement;
		const tr = button.closest('tr');
		if (!tr) return;

		const formData = new FormData();
		formData.append('id', rowId);

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

<svelte:head><title>Users | Tasdjil Admin</title></svelte:head>

<div class="admin-page">
	<header class="admin-page__header">
		<div>
			<h1><Users size={24} /> Users</h1>
			<p>Manage user accounts and roles.</p>
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
		<h2>Filter users</h2>
		<form class="user-filter" method="get">
			<label class="entity-form__field">
				Search
				<input type="text" name="search" bind:value={searchValue} placeholder="Name or email..." />
			</label>
			<label class="entity-form__field">
				Role
				<select name="role" bind:value={roleValue}>
					<option value="">All roles</option>
					<option value="admin">Admin</option>
					<option value="adminfac">Admin Faculty</option>
					<option value="student">Student</option>
				</select>
			</label>
			<button type="submit"><Filter size={14} /> Filter</button>
		</form>
	</section>

	<section class="admin-panel">
		<h2>Add user</h2>
		<form class="entity-form entity-form--user" method="post" action="?/create" use:enhance>
			<label class="entity-form__field">
				Name
				<input type="text" name="name" autocomplete="off" required />
			</label>
			<label class="entity-form__field">
				Email
				<input type="email" name="email" autocomplete="off" required />
			</label>
			<label class="entity-form__field">
				Password
				<input type="password" name="password" autocomplete="new-password" required minlength="8" />
			</label>
			<label class="entity-form__field">
				Role
				<select name="role" required>
					<option value="student">Student</option>
					<option value="admin">Admin</option>
					<option value="adminfac">Admin Faculty</option>
				</select>
			</label>
			<label class="entity-form__field">
				Faculty
				<select name="facultyId">
					<option value="">No faculty</option>
					{#each data.faculties as faculty (faculty.id)}
						<option value={faculty.id}>{faculty.name}</option>
					{/each}
				</select>
			</label>
			<button type="submit"><Plus size={14} /> Add user</button>
		</form>
	</section>

	<section class="admin-panel">
		<h2>Existing users ({data.users.length})</h2>

		<DataTable {table} emptyMessage="No users found.">
			{#snippet children(row)}
				{@const savedUser = row.original}
				<tr class:editing={editingRowId === savedUser.id}>
					<td>
						{#if editingRowId === savedUser.id}
							<input type="text" name="name" value={savedUser.name} class="dt-input" required />
						{:else}
							{savedUser.name}
						{/if}
					</td>
					<td>
						{#if editingRowId === savedUser.id}
							<input type="email" name="email" value={savedUser.email} class="dt-input" required />
						{:else}
							{savedUser.email}
						{/if}
					</td>
					<td>
						{#if editingRowId === savedUser.id}
							<select name="role" class="dt-select" required>
								<option value="student" selected={savedUser.role === 'student'}>Student</option>
								<option value="admin" selected={savedUser.role === 'admin'}>Admin</option>
								<option value="adminfac" selected={savedUser.role === 'adminfac'}
									>Admin Faculty</option
								>
							</select>
						{:else}
							{savedUser.role}
						{/if}
					</td>
					<td>
						{#if editingRowId === savedUser.id}
							<select name="facultyId" class="dt-select">
								<option value="">No faculty</option>
								{#each data.faculties as faculty (faculty.id)}
									<option value={faculty.id} selected={savedUser.facultyId === faculty.id}>
										{faculty.name}
									</option>
								{/each}
							</select>
						{:else}
							{@const faculty = data.faculties.find((f) => f.id === savedUser.facultyId)}
							{faculty ? faculty.name : ''}
						{/if}
					</td>
					<td>
						<div class="dt-actions">
							{#if editingRowId === savedUser.id}
								<button
									type="button"
									class="dt-btn-save"
									onclick={(e) => handleSave(e, savedUser.id)}
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
									onclick={() => (editingRowId = savedUser.id)}
								>
									<Pencil size={12} /> Edit
								</button>
								<form method="post" action="?/delete" use:enhance style="display:inline">
									<input type="hidden" name="id" value={savedUser.id} />
									<button type="submit" class="dt-btn-delete" aria-label="Delete {savedUser.name}">
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
