<script lang="ts">
	import { resolve } from '$app/paths';
	import type { ActionData, PageData } from './$types';
	import * as m from '$lib/paraglide/messages.js';
	import SearchableSelect from '$lib/components/SearchableSelect.svelte';
	import {
		CalendarDays,
		User,
		BookOpen,
		Target,
		ShieldCheck,
		Upload,
		Paperclip,
		Send,
		CheckCircle,
		AlertCircle,
		CircleCheck,
		Info,
		Circle
	} from '@lucide/svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let selectedSystem = $derived(data.application?.educationalSystem ?? 'LMD');
	let selectedRequestedLevel = $derived(data.application?.requestedLevel ?? '');
	let selectedDomainId: number | '' = $derived(data.application?.domainId ?? '');
	let selectedPreferences: Array<number | ''> = $derived([
		data.application?.preference1 ?? '',
		data.application?.preference2 ?? '',
		data.application?.preference3 ?? ''
	]);
	let relatedDomains = $derived(
		data.domains.filter((domain) => domain.studyLevel === selectedRequestedLevel)
	);
	let relatedSpecialities = $derived(
		data.specialities.filter((speciality) => speciality.domaineId === selectedDomainId)
	);
	let visibleAverageYears = $derived(
		selectedSystem === 'DEUA' || selectedSystem === 'LMD'
			? 3
			: selectedSystem === 'Classic (4 years)'
				? 4
				: selectedSystem === 'Classic (5 years)'
					? 5
					: 6
	);
	let canEdit = $derived(
		Boolean(
			data.currentSession?.registrationOpened &&
			data.isOwnApplication &&
			!data.application?.isProcessed
		)
	);

	function averageValue(year: number) {
		const application = data.application;
		if (!application) return '';
		if (year === 1) return application.generalAverageYear1;
		if (year === 2) return application.generalAverageYear2;
		if (year === 3) return application.generalAverageYear3;
		if (year === 4) return application.generalAverageYear4 ?? '';
		if (year === 5) return application.generalAverageYear5 ?? '';
		return application.generalAverageYear6 ?? '';
	}

	function resetRequestedProgram() {
		selectedDomainId = '';
		resetPreferences();
	}

	function resetPreferences() {
		selectedPreferences = ['', '', ''];
	}
</script>

<svelte:head><title>{m.reg_app_meta_title()}</title></svelte:head>

<div class="application-page" lang="en" dir="ltr">
	<header class="application-header">
		<div class="application-header__content">
			<span class="application-eyebrow">{m.reg_app_header_eyebrow()}</span>
			<h1>{m.reg_app_title()}</h1>
			<p>{m.reg_app_intro()}</p>
		</div>
		{#if data.currentSession}
			<span
				class:session-status--open={data.currentSession.registrationOpened}
				class="session-status"
			>
				<Circle size={10} />
				{data.currentSession.registrationOpened
					? m.reg_app_session_open()
					: m.reg_app_session_closed()}
			</span>
		{/if}
	</header>

	{#if form?.message}
		<p
			class:alert--success={form.success}
			class:alert--error={!form.success}
			class="alert"
			role="status"
		>
			{#if form.success}<CircleCheck size={18} />{:else}<AlertCircle size={18} />{/if}
			{form.message}
		</p>
	{/if}

	{#if !data.currentSession}
		<p class="alert alert--error">
			<AlertCircle size={18} />
			{m.reg_app_alert_no_session()}
		</p>
	{:else if !data.currentSession.registrationOpened}
		<p class="alert alert--error"><AlertCircle size={18} /> {m.reg_app_alert_session_closed()}</p>
	{:else if data.application?.isProcessed && data.isOwnApplication}
		<p class="alert alert--info">
			<Info size={18} />
			{m.reg_app_alert_processed()}
		</p>
	{/if}

	{#if data.isAdministrator && data.applications.length}
		<section class="application-panel review-panel">
			<div class="panel-heading">
				<span class="section-number" aria-hidden="true"><ShieldCheck size={18} /></span>
				<div>
					<h2>{m.reg_app_review_title()}</h2>
					<p>{m.reg_app_review_intro()}</p>
				</div>
			</div>
			<div class="review-list">
				{#each data.applications as item (item.id)}
					<form method="get">
						<button
							class:review-list__selected={data.application?.id === item.id}
							name="application"
							value={item.id}
						>
							<span>{item.studentName}</span>
							<small class:review-status--processed={item.isProcessed}
								>{item.isProcessed
									? m.reg_apps_status_processed()
									: m.reg_apps_status_pending()}</small
							>
						</button>
					</form>
				{/each}
			</div>
		</section>
	{/if}

	<form method="post" action="?/save" enctype="multipart/form-data">
		<fieldset disabled={!canEdit}>
			<section class="application-panel session-panel">
				<div class="panel-heading">
					<span class="section-number" aria-hidden="true"><CalendarDays size={18} /></span>
					<div>
						<h2>{m.reg_app_session_panel_title()}</h2>
						<p>{m.reg_app_session_panel_intro()}</p>
					</div>
				</div>
				<label class="application-field">
					{m.reg_app_current_session()}
					<input value={data.currentSession?.nameSession ?? m.reg_app_no_session()} readonly />
				</label>
			</section>

			<section class="application-panel">
				<div class="panel-heading">
					<span class="section-number" aria-hidden="true"><User size={18} /></span>
					<div>
						<h2>{m.reg_apps_section_personal()}</h2>
						<p>{m.reg_app_personal_intro()}</p>
					</div>
				</div>
				<div class="application-grid">
					<label class="application-field"
						>{m.reg_apps_field_last_name()}<input
							name="lastName"
							value={data.application?.lastName ?? ''}
							required
						/></label
					>
					<label class="application-field"
						>{m.reg_apps_field_first_name()}<input
							name="firstName"
							value={data.application?.firstName ?? ''}
							required
						/></label
					>
					<label class="application-field"
						>{m.reg_apps_field_last_name_ar()}<input
							name="lastNameAr"
							value={data.application?.lastNameAr ?? ''}
							dir="rtl"
							required
						/></label
					>
					<label class="application-field"
						>{m.reg_apps_field_first_name_ar()}<input
							name="firstNameAr"
							value={data.application?.firstNameAr ?? ''}
							dir="rtl"
							required
						/></label
					>
					<label class="application-field"
						>{m.reg_apps_field_date_of_birth()}<input
							type="date"
							name="dateOfBirth"
							value={data.application?.dateOfBirth ?? ''}
							required
						/></label
					>
					<label class="application-field"
						>{m.reg_apps_field_place_of_birth()}<input
							name="placeOfBirth"
							value={data.application?.placeOfBirth ?? ''}
							required
						/></label
					>
					<label class="application-field"
						>{m.reg_apps_field_phone()}<input
							type="tel"
							name="phoneNumber"
							value={data.application?.phoneNumber ?? ''}
							autocomplete="tel"
							required
						/></label
					>
				</div>
			</section>

			<section class="application-panel">
				<div class="panel-heading">
					<span class="section-number" aria-hidden="true"><BookOpen size={18} /></span>
					<div>
						<h2>{m.reg_apps_section_academic()}</h2>
						<p>{m.reg_app_academic_intro()}</p>
					</div>
				</div>
				<div class="application-grid">
					<div class="application-field">
						<span>{m.reg_apps_field_establishment()}</span>
						<SearchableSelect
							name="establishmentId"
							value={data.application?.establishmentId ?? ''}
							options={data.establishments.map((establishment) => ({
								value: establishment.id,
								label: establishment.name
							}))}
							placeholder={m.reg_app_select_establishment()}
							label={m.reg_apps_field_establishment()}
							searchPlaceholder={m.reg_app_search_options()}
							noResults={m.reg_app_no_search_results()}
							required
						/>
					</div>
					<label class="application-field"
						>{m.reg_apps_field_field_of_study()}<input
							name="fieldOfStudy"
							value={data.application?.fieldOfStudy ?? ''}
							required
						/></label
					>
					<label class="application-field"
						>{m.reg_apps_field_specialization()}<input
							name="specialization"
							value={data.application?.specialization ?? ''}
							required
						/></label
					>
					<label class="application-field"
						>{m.reg_apps_field_graduation_year()}<input
							type="number"
							name="graduationYear"
							min="1900"
							max="2100"
							value={data.application?.graduationYear ?? ''}
							required
						/></label
					>
					<label class="application-field"
						>{m.reg_apps_field_baccalaureate_year()}<input
							type="number"
							name="baccalaureateYear"
							min="1900"
							max="2100"
							value={data.application?.baccalaureateYear ?? ''}
							required
						/></label
					>
					<label class="application-field"
						>{m.reg_apps_field_baccalaureate_number()}<input
							name="baccalaureateNumber"
							value={data.application?.baccalaureateNumber ?? ''}
							required
						/></label
					>
					<label class="application-field">
						{m.reg_apps_field_educational_system()}
						<select name="educationalSystem" bind:value={selectedSystem} required>
							{#each data.educationalSystems as system (system)}
								<option value={system}>{system}</option>
							{/each}
						</select>
					</label>
				</div>

				<div class="academic-results">
					<div class="subsection-heading">
						<strong>{m.reg_app_annual_results()}</strong>
						<span>{m.reg_app_annual_results_hint()}</span>
					</div>
					<div class="averages">
						{#each Array.from({ length: visibleAverageYears }, (_, index) => index + 1) as year (year)}
							<label class="application-field">
								{m.reg_app_average_year({ year })}
								<input
									type="number"
									name={`generalAverageYear${year}`}
									min="0"
									max="20"
									step="0.01"
									value={averageValue(year)}
									required
								/>
							</label>
						{/each}
					</div>
				</div>

				<div class="application-grid">
					<label class="application-field"
						>{m.reg_apps_field_makeup_exams()}<input
							type="number"
							name="admissionsAfterMakeupExamsCount"
							min="0"
							value={data.application?.admissionsAfterMakeupExamsCount ?? 0}
							required
						/></label
					>
					<label class="application-field"
						>{m.reg_apps_field_debts()}<input
							type="number"
							name="admissionsWithDebtsCount"
							min="0"
							value={data.application?.admissionsWithDebtsCount ?? 0}
							required
						/></label
					>
					<label class="application-field"
						>{m.reg_apps_field_repeated_years()}<input
							type="number"
							name="repeatedYearsCount"
							min="0"
							value={data.application?.repeatedYearsCount ?? 0}
							required
						/></label
					>
				</div>
			</section>

			<section class="application-panel program-panel">
				<div class="panel-heading">
					<span class="section-number" aria-hidden="true"><Target size={18} /></span>
					<div>
						<h2>{m.reg_apps_section_program()}</h2>
						<p>{m.reg_app_program_intro()}</p>
					</div>
				</div>
				<div class="application-grid">
					<label class="application-field">
						{m.reg_apps_field_requested_level()}
						<select
							name="requestedLevel"
							bind:value={selectedRequestedLevel}
							onchange={resetRequestedProgram}
							required
						>
							<option value="" disabled>{m.reg_app_select_level()}</option>
							{#each data.studyLevels as level (level)}<option value={level}>{level}</option>{/each}
						</select>
					</label>
					<div class="application-field">
						<span>{m.reg_apps_domain_label()}</span>
						<SearchableSelect
							name="domainId"
							bind:value={selectedDomainId}
							onchange={resetPreferences}
							disabled={!selectedRequestedLevel}
							options={relatedDomains.map((domain) => ({ value: domain.id, label: domain.name }))}
							placeholder={m.reg_app_select_domain()}
							label={m.reg_apps_domain_label()}
							searchPlaceholder={m.reg_app_search_options()}
							noResults={m.reg_app_no_search_results()}
							required
						/>
					</div>
					{#each [1, 2, 3] as preference (preference)}
						<div class="application-field">
							<span class="preference-label"
								><b>{preference}</b> {m.reg_app_preference({ n: preference })}</span
							>
							<SearchableSelect
								name={`preference${preference}`}
								bind:value={selectedPreferences[preference - 1]}
								disabled={!selectedDomainId}
								options={relatedSpecialities.map((speciality) => ({
									value: speciality.id,
									label: speciality.name
								}))}
								placeholder={m.reg_app_select_speciality()}
								label={m.reg_app_preference({ n: preference })}
								searchPlaceholder={m.reg_app_search_options()}
								noResults={m.reg_app_no_search_results()}
								required
							/>
						</div>
					{/each}
				</div>
			</section>

			<section class="application-panel attachment-panel">
				<div class="panel-heading">
					<span class="section-number" aria-hidden="true"><Upload size={18} /></span>
					<div>
						<h2>{m.reg_app_attachment()}</h2>
						<p>{m.reg_app_required_documents()}</p>
					</div>
				</div>
				<div class="attachment-content">
					<p class="document-notice"><Info size={17} /> {m.reg_app_merge_pdf_notice()}</p>
					<label class="application-field attachment-field">
						<span><Paperclip size={14} /> {m.reg_app_pdf_file()}</span>
						<input
							type="file"
							name="attachment"
							accept="application/pdf"
							required={!data.application?.attachment}
						/>
						<small>{m.reg_app_attachment_hint()}</small>
						{#if data.application?.attachment}<a
								href={resolve('/registration-application/[id]/attachment', {
									id: String(data.application.id)
								})}
								target="_blank"
								rel="noopener noreferrer"><Paperclip size={14} /> {m.reg_app_view_attachment()}</a
							>{/if}
					</label>
				</div>
			</section>

			{#if canEdit}
				<div class="form-actions">
					<div>
						<strong>{data.application ? m.reg_app_save_prompt() : m.reg_app_apply_prompt()}</strong>
						<span>{m.reg_app_save_hint()}</span>
					</div>
					<button class="submit-button" type="submit"
						><Send size={16} />
						{data.application ? m.reg_app_update_button() : m.reg_app_submit_button()}</button
					>
				</div>
			{/if}
		</fieldset>
	</form>

	{#if data.isAdministrator && data.application}
		<section class="application-panel administration-panel">
			<div class="panel-heading">
				<span class="section-number" aria-hidden="true"><ShieldCheck size={18} /></span>
				<div>
					<h2>{m.reg_app_admin_title()}</h2>
					<p>{m.reg_app_admin_intro()}</p>
				</div>
			</div>
			<form class="administration-form" method="post" action="?/process">
				<input type="hidden" name="id" value={data.application.id} />
				<label class="application-field">
					{m.reg_apps_field_decision()}
					<select
						name="isAccepted"
						value={data.application.isProcessed ? String(data.application.isAccepted) : ''}
						required
					>
						<option value="" disabled>{m.reg_apps_decision_placeholder()}</option>
						<option value="true">{m.reg_app_accepted()}</option>
						<option value="false">{m.reg_app_rejected()}</option>
					</select>
				</label>
				<label class="application-field administration-form__remark"
					>{m.reg_apps_field_remark()}<textarea name="remark" rows="3"
						>{data.application.remark ?? ''}</textarea
					></label
				>
				<label class="application-field"
					>{m.reg_apps_field_processed()}<input
						value={data.application.isProcessed ? m.reg_apps_yes() : m.reg_apps_no()}
						readonly
					/></label
				>
				<button class="submit-button" type="submit"
					><CheckCircle size={16} /> {m.reg_apps_save_decision()}</button
				>
			</form>
			<small>{m.reg_app_admin_notice()}</small>
		</section>
	{/if}
</div>

<style>
	.application-page,
	fieldset {
		display: grid;
		gap: 1.75rem;
	}
	.application-page {
		position: relative;
	}
	fieldset {
		margin: 0;
		border: 0;
		padding: 0;
	}
	.application-header {
		position: relative;
		overflow: hidden;
		display: flex;
		min-height: 10rem;
		align-items: center;
		justify-content: space-between;
		gap: 2rem;
		border: 1px solid #bfdbfe;
		border-radius: 1.25rem;
		background: linear-gradient(135deg, #eff6ff 0%, #ffffff 52%, #eef2ff 100%);
		padding: 2.25rem 2.5rem;
		box-shadow: 0 1rem 3rem rgb(37 99 235 / 8%);
	}
	.application-header::after {
		position: absolute;
		right: -4rem;
		bottom: -6rem;
		width: 14rem;
		height: 14rem;
		border: 2.5rem solid rgb(37 99 235 / 6%);
		border-radius: 50%;
		content: '';
		pointer-events: none;
	}
	.application-header__content {
		position: relative;
		z-index: 1;
		max-width: 42rem;
	}
	.application-eyebrow {
		display: block;
		margin-bottom: 0.625rem;
		color: #2563eb;
		font-size: 0.75rem;
		font-weight: 800;
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}
	h1,
	h2 {
		margin: 0;
		color: #0f172a;
	}
	h1 {
		font-size: clamp(2rem, 4vw, 2.75rem);
		line-height: 1.08;
		letter-spacing: -0.035em;
	}
	.application-header p,
	.panel-heading p {
		margin: 0.5rem 0 0;
		color: #64748b;
		line-height: 1.55;
	}
	.application-header p {
		max-width: 38rem;
		font-size: 1rem;
	}
	.session-status {
		position: relative;
		z-index: 1;
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		flex: 0 0 auto;
		border-radius: 999px;
		border: 1px solid #fecaca;
		background: rgb(255 255 255 / 86%);
		padding: 0.625rem 0.875rem;
		color: #991b1b;
		font-size: 0.8125rem;
		font-weight: 700;
		box-shadow: 0 0.25rem 1rem rgb(15 23 42 / 6%);
	}
	.session-status--open {
		border-color: #bbf7d0;
		color: #166534;
	}
	.alert {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin: 0;
		border: 1px solid transparent;
		border-radius: 0.875rem;
		padding: 0.875rem 1rem;
		font-size: 0.9rem;
		font-weight: 600;
		box-shadow: 0 0.25rem 1rem rgb(15 23 42 / 4%);
	}
	.alert--error {
		border-color: #fecaca;
		background: #fef2f2;
		color: #b91c1c;
	}
	.alert--success {
		border-color: #bbf7d0;
		background: #f0fdf4;
		color: #166534;
	}
	.alert--info {
		border-color: #bfdbfe;
		background: #eff6ff;
		color: #1d4ed8;
	}
	.application-panel {
		position: relative;
		border: 1px solid #e2e8f0;
		border-radius: 1rem;
		background: white;
		padding: 1.75rem;
		box-shadow: 0 0.25rem 1.5rem rgb(15 23 42 / 4%);
	}
	.panel-heading {
		display: flex;
		align-items: flex-start;
		gap: 0.875rem;
		margin-bottom: 1.5rem;
		padding-bottom: 1.25rem;
		border-bottom: 1px solid #eef2f7;
	}
	.panel-heading h2 {
		font-size: 1.2rem;
		line-height: 1.3;
		letter-spacing: -0.015em;
	}
	.panel-heading p {
		font-size: 0.875rem;
	}
	.section-number {
		display: grid;
		width: 2.35rem;
		height: 2.35rem;
		flex: 0 0 auto;
		place-items: center;
		border-radius: 0.7rem;
		background: #eff6ff;
		color: #2563eb;
		box-shadow: inset 0 0 0 1px #dbeafe;
	}
	.session-panel {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(15rem, 0.55fr);
		align-items: end;
		gap: 1.5rem;
	}
	.session-panel .panel-heading {
		margin: 0;
		padding: 0;
		border: 0;
	}
	.program-panel {
		border-color: #c7d2fe;
		background: linear-gradient(155deg, #ffffff 55%, #f8faff 100%);
		box-shadow: 0 0.75rem 2.5rem rgb(79 70 229 / 9%);
	}
	.program-panel .section-number {
		background: #eef2ff;
		color: #4f46e5;
		box-shadow: inset 0 0 0 1px #c7d2fe;
	}
	.attachment-panel {
		border-color: #bae6fd;
		background: linear-gradient(150deg, #ffffff 50%, #f0f9ff 100%);
	}
	.attachment-panel .section-number {
		background: #e0f2fe;
		color: #0369a1;
		box-shadow: inset 0 0 0 1px #bae6fd;
	}
	.attachment-content {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(18rem, 1fr);
		align-items: start;
		gap: 1.5rem;
	}
	.document-notice {
		display: flex;
		align-items: flex-start;
		gap: 0.65rem;
		margin: 0;
		border: 1px solid #bae6fd;
		border-radius: 0.75rem;
		background: #f0f9ff;
		padding: 0.9rem 1rem;
		color: #075985;
		font-size: 0.85rem;
		font-weight: 600;
		line-height: 1.55;
	}
	.document-notice :global(svg) {
		flex: 0 0 auto;
		margin-top: 0.1rem;
	}
	.attachment-field > span {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
	}
	.application-grid,
	.averages,
	.administration-form {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 1.125rem;
	}
	.academic-results {
		margin: 1.5rem 0;
		border: 1px solid #dbeafe;
		border-radius: 0.875rem;
		background: linear-gradient(180deg, #f8fbff, #f1f5ff);
		padding: 1.25rem;
	}
	.subsection-heading {
		display: flex;
		align-items: baseline;
		gap: 0.625rem;
		margin-bottom: 1rem;
	}
	.subsection-heading strong {
		color: #1e3a8a;
		font-size: 0.9rem;
	}
	.subsection-heading span {
		color: #64748b;
		font-size: 0.8rem;
	}
	.application-field {
		display: grid;
		align-content: start;
		gap: 0.45rem;
		color: #334155;
		font-size: 0.8rem;
		font-weight: 700;
	}
	.preference-label {
		display: flex;
		align-items: center;
		gap: 0.45rem;
	}
	.preference-label b {
		display: inline-grid;
		width: 1.3rem;
		height: 1.3rem;
		place-items: center;
		border-radius: 999px;
		background: #eef2ff;
		color: #4f46e5;
		font-size: 0.68rem;
	}
	.application-field input,
	.application-field select,
	.application-field textarea {
		width: 100%;
		min-height: 2.8rem;
		box-sizing: border-box;
		border: 1px solid #cbd5e1;
		border-radius: 0.625rem;
		background: white;
		padding: 0.7rem 0.8rem;
		color: #0f172a;
		font: inherit;
		font-weight: 500;
		box-shadow: 0 1px 2px rgb(15 23 42 / 3%);
		transition:
			border-color 150ms ease,
			box-shadow 150ms ease,
			background-color 150ms ease;
	}
	.application-field input:hover:not(:disabled),
	.application-field select:hover:not(:disabled),
	.application-field textarea:hover:not(:disabled) {
		border-color: #94a3b8;
	}
	.application-field input:focus-visible,
	.application-field select:focus-visible,
	.application-field textarea:focus-visible {
		border-color: #2563eb;
		outline: none;
		box-shadow: 0 0 0 3px rgb(37 99 235 / 14%);
	}
	.application-field input:read-only,
	.application-field input:disabled,
	.application-field select:disabled,
	.application-field textarea:disabled {
		background: #f8fafc;
		color: #64748b;
		cursor: not-allowed;
	}
	.application-field small {
		color: #64748b;
		font-weight: 400;
		line-height: 1.45;
	}
	.application-field a {
		width: fit-content;
		color: #1d4ed8;
		font-weight: 700;
		text-decoration: none;
	}
	.application-field a:hover {
		text-decoration: underline;
	}
	.application-field input[type='file'] {
		padding: 0.5rem;
		color: #475569;
	}
	.application-field input[type='file']::file-selector-button {
		margin-inline-end: 0.75rem;
		border: 0;
		border-radius: 0.45rem;
		background: #eff6ff;
		padding: 0.45rem 0.7rem;
		color: #1d4ed8;
		cursor: pointer;
		font: inherit;
		font-weight: 700;
	}
	.form-actions {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1.5rem;
		border: 1px solid #bfdbfe;
		border-radius: 1rem;
		background: linear-gradient(135deg, #eff6ff, #f8fafc);
		padding: 1.25rem 1.5rem;
	}
	.form-actions > div {
		display: grid;
		gap: 0.25rem;
	}
	.form-actions strong {
		color: #0f172a;
		font-size: 0.95rem;
	}
	.form-actions span {
		color: #64748b;
		font-size: 0.825rem;
	}
	.submit-button {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		min-height: 2.8rem;
		flex: 0 0 auto;
		justify-content: center;
		border: 0;
		border-radius: 0.625rem;
		background: linear-gradient(135deg, #2563eb, #1d4ed8);
		padding: 0.75rem 1.35rem;
		color: white;
		cursor: pointer;
		font: inherit;
		font-weight: 700;
		box-shadow: 0 0.45rem 1rem rgb(37 99 235 / 22%);
		transition:
			transform 150ms ease,
			box-shadow 150ms ease,
			background-color 150ms ease;
	}
	.submit-button:hover {
		transform: translateY(-1px);
		box-shadow: 0 0.65rem 1.25rem rgb(37 99 235 / 28%);
	}
	.submit-button:active {
		transform: translateY(0);
	}
	.submit-button:focus-visible,
	.review-list button:focus-visible {
		outline: 3px solid rgb(37 99 235 / 22%);
		outline-offset: 2px;
	}
	.administration-panel {
		border-color: #ddd6fe;
		background: linear-gradient(145deg, #ffffff, #faf5ff);
	}
	.administration-panel .section-number {
		background: #f3e8ff;
		color: #7e22ce;
		box-shadow: inset 0 0 0 1px #e9d5ff;
	}
	.administration-form__remark {
		grid-column: span 2;
	}
	.administration-panel > small {
		display: block;
		margin-top: 1rem;
		color: #7e22ce;
		line-height: 1.5;
	}
	.review-list {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(13rem, 1fr));
		gap: 0.75rem;
	}
	.review-list form {
		margin: 0;
	}
	.review-list button {
		display: flex;
		width: 100%;
		min-height: 3.75rem;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		border: 1px solid #cbd5e1;
		border-radius: 0.75rem;
		background: white;
		padding: 0.75rem 0.875rem;
		color: #334155;
		cursor: pointer;
		font: inherit;
		font-size: 0.875rem;
		font-weight: 700;
		text-align: start;
		text-decoration: none;
		transition:
			border-color 150ms ease,
			background-color 150ms ease,
			transform 150ms ease;
	}
	.review-list button:hover {
		transform: translateY(-1px);
		border-color: #93c5fd;
		background: #eff6ff;
	}
	.review-list__selected {
		border-color: #2563eb !important;
		background: #eff6ff !important;
		box-shadow: inset 0 0 0 1px #2563eb;
	}
	.review-list small {
		border-radius: 999px;
		background: #fef3c7;
		padding: 0.25rem 0.5rem;
		color: #92400e;
		font-size: 0.7rem;
		font-weight: 700;
	}
	.review-list .review-status--processed {
		background: #dcfce7;
		color: #166534;
	}
	@media (max-width: 50rem) {
		.application-header {
			padding: 2rem;
		}
		.session-panel {
			grid-template-columns: 1fr;
			align-items: stretch;
		}
		.session-panel .panel-heading {
			margin-bottom: 0.25rem;
		}
		.application-grid,
		.averages,
		.administration-form {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
		.attachment-content {
			grid-template-columns: 1fr;
		}
	}
	@media (max-width: 36rem) {
		.application-header {
			display: grid;
			min-height: auto;
			padding: 1.5rem;
		}
		h1 {
			font-size: 2rem;
		}
		.application-panel {
			padding: 1.25rem;
		}
		.panel-heading {
			margin-bottom: 1.25rem;
		}
		.section-number {
			width: 2rem;
			height: 2rem;
		}
		.subsection-heading,
		.form-actions {
			align-items: stretch;
			flex-direction: column;
		}
		.subsection-heading {
			display: grid;
		}
		.form-actions {
			display: flex;
		}
		.submit-button {
			width: 100%;
		}
		.application-grid,
		.averages,
		.administration-form {
			grid-template-columns: 1fr;
		}
		.administration-form__remark {
			grid-column: auto;
		}
	}
</style>
