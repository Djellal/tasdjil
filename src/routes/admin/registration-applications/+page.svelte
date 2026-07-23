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
	import Modal from '$lib/components/Modal.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import type { ActionData, PageData } from './$types';
	import type { ColumnDef } from '@tanstack/table-core';
	import {
		ClipboardList,
		Filter,
		Eye,
		Paperclip,
		User,
		BookOpen,
		Target,
		ShieldCheck,
		Clock,
		CheckCircle,
		XCircle,
		Save
	} from '@lucide/svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let searchValue = $state(data.search);
	let sessionValue = $state(data.session);
	let statusValue = $state(data.status);
	let domainValue = $state(data.domain);
	let previewOpen = $state(false);
	let selectedApp: Application | null = $state(null);

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
		if (!app.isProcessed) return m.reg_apps_status_pending();
		return app.isAccepted ? m.reg_apps_status_accepted() : m.reg_apps_status_rejected();
	}

	function statusClass(app: { isProcessed: boolean; isAccepted: boolean }) {
		if (!app.isProcessed) return 'status-badge--pending';
		return app.isAccepted ? 'status-badge--accepted' : 'status-badge--rejected';
	}

	function statusIcon(app: { isProcessed: boolean; isAccepted: boolean }) {
		if (!app.isProcessed) return Clock;
		return app.isAccepted ? CheckCircle : XCircle;
	}

	function statusIconClass(app: { isProcessed: boolean; isAccepted: boolean }) {
		if (!app.isProcessed) return 'status-icon--pending';
		return app.isAccepted ? 'status-icon--accepted' : 'status-icon--rejected';
	}

	function openPreview(app: Application) {
		selectedApp = app;
		previewOpen = true;
	}

	function averageCount(system: string) {
		if (system === 'DEUA' || system === 'LMD') return 3;
		if (system === 'Classic (4 years)') return 4;
		if (system === 'Classic (5 years)') return 5;
		return 6;
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
			header: m.reg_apps_col_student
		},
		{
			accessorKey: 'sessionName',
			header: m.reg_apps_col_session
		},
		{
			accessorKey: 'domainName',
			header: m.reg_apps_col_domain
		},
		{
			accessorKey: 'studyLevel',
			header: m.reg_apps_col_level
		},
		{
			id: 'preferences',
			header: m.reg_apps_col_preferences,
			enableSorting: false
		},
		{
			id: 'status',
			header: m.reg_apps_col_status,
			accessorFn: (row) => statusLabel(row),
			enableSorting: true
		},
		{
			id: 'actions',
			header: m.reg_apps_col_actions,
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

<svelte:head><title>{m.reg_apps_meta_title()}</title></svelte:head>

<div class="admin-page">
	<header class="admin-page__header">
		<div>
			<h1><ClipboardList size={24} /> {m.reg_apps_title()}</h1>
			<p>{m.reg_apps_intro()}</p>
		</div>
	</header>

	<section class="admin-panel">
		<h2>{m.reg_apps_filter_title()}</h2>
		<form class="applications-filter" method="get">
			<label class="entity-form__field">
				{m.reg_apps_search_label()}
				<input
					type="text"
					name="search"
					bind:value={searchValue}
					placeholder={m.reg_apps_search_placeholder()}
				/>
			</label>
			<label class="entity-form__field">
				{m.reg_apps_session_label()}
				<select name="session" bind:value={sessionValue}>
					<option value="">{m.reg_apps_session_all()}</option>
					{#each data.sessions as s (s.id)}
						<option value={s.id}>{s.name}</option>
					{/each}
				</select>
			</label>
			<label class="entity-form__field">
				{m.reg_apps_status_label()}
				<select name="status" bind:value={statusValue}>
					<option value="">{m.reg_apps_status_all()}</option>
					<option value="pending">{m.reg_apps_status_pending()}</option>
					<option value="processed">{m.reg_apps_status_processed()}</option>
					<option value="accepted">{m.reg_apps_status_accepted()}</option>
					<option value="rejected">{m.reg_apps_status_rejected()}</option>
				</select>
			</label>
			<label class="entity-form__field">
				{m.reg_apps_domain_label()}
				<select name="domain" bind:value={domainValue}>
					<option value="">{m.reg_apps_domain_all()}</option>
					{#each data.domains as d (d.id)}
						<option value={d.id}>{d.name}</option>
					{/each}
				</select>
			</label>
			<button type="submit"><Filter size={14} /> {m.reg_apps_filter_button()}</button>
		</form>
	</section>

	<section class="admin-panel">
		<h2>{m.reg_apps_count_title({ count: data.applications.length })}</h2>

		<DataTable {table} emptyMessage={m.reg_apps_empty()}>
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
						<Eye size={14} /> {m.reg_apps_view()}
					</a>
					<button class="preview-btn" type="button" onclick={() => openPreview(app)}>
						<Eye size={14} /> {m.reg_apps_preview()}
					</button>
				</td>
				</tr>
			{/snippet}
		</DataTable>
	</section>
</div>

<Modal bind:open={previewOpen} title={m.reg_apps_preview_title()}>
	{#if selectedApp}
		{@const app = selectedApp}
		{@const SIcon = statusIcon(app)}
		<div class="preview">
			<div class="preview-status-bar">
				<span class="preview-status-badge {statusClass(app)}">
					<SIcon size={14} /> {statusLabel(app)}
				</span>
			</div>

			<section class="preview-section preview-section--personal">
				<h3><User size={16} /> {m.reg_apps_section_personal()}</h3>
				<dl class="preview-grid">
					<div>
						<dt>{m.reg_apps_field_last_name()}</dt>
						<dd>{app.lastName}</dd>
					</div>
					<div>
						<dt>{m.reg_apps_field_first_name()}</dt>
						<dd>{app.firstName}</dd>
					</div>
					<div>
						<dt>{m.reg_apps_field_last_name_ar()}</dt>
						<dd dir="rtl">{app.lastNameAr}</dd>
					</div>
					<div>
						<dt>{m.reg_apps_field_first_name_ar()}</dt>
						<dd dir="rtl">{app.firstNameAr}</dd>
					</div>
					<div>
						<dt>{m.reg_apps_field_date_of_birth()}</dt>
						<dd>{app.dateOfBirth}</dd>
					</div>
					<div>
						<dt>{m.reg_apps_field_place_of_birth()}</dt>
						<dd>{app.placeOfBirth}</dd>
					</div>
					<div>
						<dt>{m.reg_apps_field_phone()}</dt>
						<dd>{app.phoneNumber}</dd>
					</div>
					<div>
						<dt>{m.reg_apps_field_email()}</dt>
						<dd>{app.studentEmail}</dd>
					</div>
				</dl>
			</section>

			<section class="preview-section preview-section--academic">
				<h3><BookOpen size={16} /> {m.reg_apps_section_academic()}</h3>
				<dl class="preview-grid">
					<div>
						<dt>{m.reg_apps_field_establishment()}</dt>
						<dd>{app.establishmentName}</dd>
					</div>
					<div>
						<dt>{m.reg_apps_field_field_of_study()}</dt>
						<dd>{app.fieldOfStudy}</dd>
					</div>
					<div>
						<dt>{m.reg_apps_field_specialization()}</dt>
						<dd>{app.specialization}</dd>
					</div>
					<div>
						<dt>{m.reg_apps_field_graduation_year()}</dt>
						<dd>{app.graduationYear}</dd>
					</div>
					<div>
						<dt>{m.reg_apps_field_baccalaureate_year()}</dt>
						<dd>{app.baccalaureateYear}</dd>
					</div>
					<div>
						<dt>{m.reg_apps_field_baccalaureate_number()}</dt>
						<dd>{app.baccalaureateNumber}</dd>
					</div>
					<div>
						<dt>{m.reg_apps_field_educational_system()}</dt>
						<dd>{app.educationalSystem}</dd>
					</div>
				</dl>

				<h4>{m.reg_apps_averages_title()}</h4>
				<div class="preview-averages">
					{#each Array.from({ length: averageCount(app.educationalSystem) }, (_, i) => i + 1) as year (year)}
						{@const avg = year === 1 ? app.generalAverageYear1 : year === 2 ? app.generalAverageYear2 : year === 3 ? app.generalAverageYear3 : year === 4 ? app.generalAverageYear4 : year === 5 ? app.generalAverageYear5 : app.generalAverageYear6}
						{#if avg != null}
							<span class="preview-average">
								<small>{m.reg_apps_averages_year({ year })}</small>
								<strong>{avg.toFixed(2)}</strong>
							</span>
						{/if}
					{/each}
				</div>

				<dl class="preview-grid">
					<div>
						<dt>{m.reg_apps_field_makeup_exams()}</dt>
						<dd>{app.admissionsAfterMakeupExamsCount}</dd>
					</div>
					<div>
						<dt>{m.reg_apps_field_debts()}</dt>
						<dd>{app.admissionsWithDebtsCount}</dd>
					</div>
					<div>
						<dt>{m.reg_apps_field_repeated_years()}</dt>
						<dd>{app.repeatedYearsCount}</dd>
					</div>
				</dl>
			</section>

			<section class="preview-section preview-section--program">
				<h3><Target size={16} /> {m.reg_apps_section_program()}</h3>
				<dl class="preview-grid">
					<div>
						<dt>{m.reg_apps_field_requested_level()}</dt>
						<dd>{app.studyLevel}</dd>
					</div>
					<div>
						<dt>{m.reg_apps_col_domain()}</dt>
						<dd>{app.domainName}</dd>
					</div>
					<div>
						<dt>{m.reg_apps_field_preference_1()}</dt>
						<dd>{app.preference1Name}</dd>
					</div>
					<div>
						<dt>{m.reg_apps_field_preference_2()}</dt>
						<dd>{app.preference2Name}</dd>
					</div>
					<div>
						<dt>{m.reg_apps_field_preference_3()}</dt>
						<dd>{app.preference3Name}</dd>
					</div>
				</dl>
				{#if app.attachment}
					<p class="preview-attachment">
						<Paperclip size={14} />
						<a
							href="{localizedPath('/registration-application')}/{app.id}/attachment"
							target="_blank"
							rel="noopener noreferrer"
						>{m.reg_apps_view_attachment()}</a>
					</p>
				{/if}
			</section>

			<section class="preview-section preview-section--status">
				<h3><ShieldCheck size={16} /> {m.reg_apps_section_status()}</h3>

				{#if data.isAdministrator && !app.isProcessed}
					{#if form?.processMessage}
						<p class="preview-alert" class:preview-alert--success={form.processSuccess} class:preview-alert--error={!form.processSuccess}>
							{form.processMessage}
						</p>
					{/if}
					<form class="preview-decision-form" method="post" action="?/process">
						<input type="hidden" name="id" value={app.id} />
						<label class="entity-form__field">
							{m.reg_apps_field_decision()}
							<select name="isAccepted" required>
								<option value="">{m.reg_apps_decision_placeholder()}</option>
								<option value="true">{m.reg_apps_status_accepted()}</option>
								<option value="false">{m.reg_apps_status_rejected()}</option>
							</select>
						</label>
						<label class="entity-form__field">
							{m.reg_apps_field_remark()}
							<textarea name="remark" rows="3"></textarea>
						</label>
						<button class="preview-save-btn" type="submit">
							<Save size={14} /> {m.reg_apps_save_decision()}
						</button>
					</form>
				{:else}
					<dl class="preview-grid">
						<div>
							<dt>{m.reg_apps_field_processed()}</dt>
							<dd>{app.isProcessed ? m.reg_apps_yes() : m.reg_apps_no()}</dd>
						</div>
						<div>
							<dt>{m.reg_apps_field_decision()}</dt>
							<dd>
								<span class="status-badge {statusClass(app)}">
									{statusLabel(app)}
								</span>
							</dd>
						</div>
						{#if app.remark}
							<div class="preview-remark">
								<dt>{m.reg_apps_field_remark()}</dt>
								<dd>{app.remark}</dd>
							</div>
						{/if}
					</dl>
				{/if}
			</section>
		</div>
	{/if}
</Modal>

<style>
	.preview {
		display: grid;
		gap: 1.5rem;
	}

	.preview-status-bar {
		display: flex;
		justify-content: flex-end;
	}

	.preview-status-badge {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		border-radius: 999px;
		padding: 0.375rem 0.875rem;
		font-size: 0.8125rem;
		font-weight: 600;
	}

	.preview-section {
		display: grid;
		gap: 0.75rem;
	}

	.preview-section h3 {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin: 0;
		padding: 0.625rem 0.875rem;
		border-radius: 0.5rem;
		color: var(--ufas-green);
		font-size: 0.9375rem;
		background: #f0fdf4;
	}

	.preview-section--personal h3 { color: #1d4ed8; background: #eff6ff; }
	.preview-section--academic h3 { color: #0f766e; background: #f0fdfa; }
	.preview-section--program h3 { color: #6d28d9; background: #f5f3ff; }
	.preview-section--status h3 { color: #b45309; background: #fffbeb; }

	.preview-section h3 :global(svg) {
		flex: none;
	}

	.preview-section--personal h3 :global(svg) { color: #2563eb; }
	.preview-section--academic h3 :global(svg) { color: #0d9488; }
	.preview-section--program h3 :global(svg) { color: #7c3aed; }
	.preview-section--status h3 :global(svg) { color: #d97706; }

	.preview-section h4 {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		margin: 0.5rem 0 0;
		color: #475569;
		font-size: 0.8125rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.preview-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr));
		gap: 0.75rem;
		margin: 0;
	}

	.preview-grid > div {
		display: grid;
		gap: 0.125rem;
	}

	.preview-grid dt {
		color: #64748b;
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.preview-grid dd {
		margin: 0;
		color: #1e293b;
		font-size: 0.875rem;
	}

	.preview-remark {
		grid-column: 1 / -1;
	}

	.preview-averages {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
	}

	.preview-average {
		display: grid;
		gap: 0.125rem;
		border: 1px solid #e2e8f0;
		border-radius: 0.5rem;
		padding: 0.5rem 0.75rem;
		background: #f8fafc;
	}

	.preview-average small {
		color: #64748b;
		font-size: 0.6875rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.preview-average strong {
		color: #1e293b;
		font-size: 1rem;
	}

	.preview-attachment {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		margin: 0.5rem 0 0;
	}

	.preview-attachment a {
		color: var(--ufas-green-hover);
		font-size: 0.875rem;
		font-weight: 600;
	}

	.preview-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		border: 1px solid #e2e8f0;
		border-radius: 0.375rem;
		background: white;
		padding: 0.25rem 0.625rem;
		color: #475569;
		cursor: pointer;
		font: inherit;
		font-size: 0.75rem;
		font-weight: 600;
		white-space: nowrap;
	}

	.preview-btn:hover {
		background: #f8fafc;
		color: #1e293b;
	}

	.preview-decision-form {
		display: grid;
		gap: 0.75rem;
	}

	.preview-save-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.375rem;
		border: 0;
		border-radius: 0.5rem;
		background: var(--ufas-green);
		padding: 0.625rem 1.25rem;
		color: white;
		cursor: pointer;
		font: inherit;
		font-size: 0.875rem;
		font-weight: 600;
		justify-self: start;
		transition: background-color 150ms ease;
	}

	.preview-save-btn:hover {
		background: var(--ufas-green-hover);
	}

	.preview-alert {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin: 0;
		border-radius: 0.5rem;
		padding: 0.75rem 1rem;
		font-size: 0.875rem;
	}

	.preview-alert--success {
		background: #f0fdf4;
		color: #166534;
	}

	.preview-alert--error {
		background: #fef2f2;
		color: #b91c1c;
	}
</style>
