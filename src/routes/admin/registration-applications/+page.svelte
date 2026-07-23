<script lang="ts">
	import type { Pathname } from '$app/types';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { baseLocale, extractLocaleFromUrl, localizeHref } from '$lib/paraglide/runtime';
	import {
		createTable,
		tableFeatures,
		rowSortingFeature,
		rowPaginationFeature
	} from '@tanstack/svelte-table';
	import { createSortedRowModel, createPaginatedRowModel, sortFns } from '@tanstack/table-core';
	import DataTable from '$lib/components/DataTable.svelte';
	import '$lib/components/data-table.css';
	import type { PageData } from './$types';
	import type { ColumnDef } from '@tanstack/table-core';
	import { ClipboardList, Filter, Eye } from '@lucide/svelte';

	let { data }: { data: PageData } = $props();
	let searchValue = $state(data.search);
	let sessionValue = $state(data.session);
	let statusValue = $state(data.status);
	let domainValue = $state(data.domain);

	let locale = $derived(extractLocaleFromUrl(page.url) ?? baseLocale);
	const localizedPath = (path: Pathname) => resolve(localizeHref(path, { locale }) as Pathname);

	$effect(() => {
		searchValue = data.search;
		sessionValue = data.session;
		statusValue = data.status;
		domainValue = data.domain;
	});

	type Application = (typeof data.applications)[number];

	function statusLabel(app: { isProcessed: boolean; isAccepted: boolean }) {
		if (!app.isProcessed) return 'Pending';
		return app.isAccepted ? 'Accepted' : 'Rejected';
	}

	function statusClass(app: { isProcessed: boolean; isAccepted: boolean }) {
		if (!app.isProcessed) return 'status-badge--pending';
		return app.isAccepted ? 'status-badge--accepted' : 'status-badge--rejected';
	}

	const features = tableFeatures({
		rowSortingFeature,
		rowPaginationFeature,
		sortedRowModel: createSortedRowModel(),
		paginatedRowModel: createPaginatedRowModel(),
		sortFns
	});

	const columns: ColumnDef<typeof features, Application>[] = [
		{
			accessorKey: 'studentName',
			header: 'Student'
		},
		{
			accessorKey: 'sessionName',
			header: 'Session'
		},
		{
			accessorKey: 'domainName',
			header: 'Domain'
		},
		{
			accessorKey: 'studyLevel',
			header: 'Level'
		},
		{
			id: 'preferences',
			header: 'Preferences',
			enableSorting: false
		},
		{
			id: 'status',
			header: 'Status',
			accessorFn: (row) => statusLabel(row),
			enableSorting: true
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
			return data.applications;
		},
		initialState: {
			pagination: {
				pageIndex: 0,
				pageSize: 20
			}
		}
	});
</script>

<svelte:head><title>Registration Applications | Tasdjil Admin</title></svelte:head>

<div class="admin-page">
	<header class="admin-page__header">
		<div>
			<h1><ClipboardList size={24} /> Registration Applications</h1>
			<p>View and manage student registration applications.</p>
		</div>
	</header>

	<section class="admin-panel">
		<h2>Filter applications</h2>
		<form class="applications-filter" method="get">
			<label class="entity-form__field">
				Search
				<input
					type="text"
					name="search"
					bind:value={searchValue}
					placeholder="Student name or email..."
				/>
			</label>
			<label class="entity-form__field">
				Session
				<select name="session" bind:value={sessionValue}>
					<option value="">All sessions</option>
					{#each data.sessions as s (s.id)}
						<option value={s.id}>{s.name}</option>
					{/each}
				</select>
			</label>
			<label class="entity-form__field">
				Status
				<select name="status" bind:value={statusValue}>
					<option value="">All statuses</option>
					<option value="pending">Pending</option>
					<option value="processed">Processed</option>
					<option value="accepted">Accepted</option>
					<option value="rejected">Rejected</option>
				</select>
			</label>
			<label class="entity-form__field">
				Domain
				<select name="domain" bind:value={domainValue}>
					<option value="">All domains</option>
					{#each data.domains as d (d.id)}
						<option value={d.id}>{d.name}</option>
					{/each}
				</select>
			</label>
			<button type="submit"><Filter size={14} /> Filter</button>
		</form>
	</section>

	<section class="admin-panel">
		<h2>Applications ({data.applications.length})</h2>

		<DataTable {table} emptyMessage="No applications found.">
			{#snippet children(row)}
				{@const app = row.original}
				<tr>
					<td>
						<div class="student-cell">
							<span class="student-name">{app.studentName}</span>
							<span class="student-email">{app.studentEmail}</span>
						</div>
					</td>
					<td>{app.sessionName}</td>
					<td>{app.domainName}</td>
					<td>{app.studyLevel}</td>
					<td>
						<div class="preferences-cell">
							<span>{app.preference1Name}</span>
							<span>{app.preference2Name}</span>
							<span>{app.preference3Name}</span>
						</div>
					</td>
					<td>
						<span class="status-badge {statusClass(app)}">
							{statusLabel(app)}
						</span>
					</td>
					<td>
					<a
						class="view-link"
						href="{localizedPath('/registration-application')}?application={app.id}"
					>
						<Eye size={14} /> View
					</a>
					</td>
				</tr>
			{/snippet}
		</DataTable>
	</section>
</div>
