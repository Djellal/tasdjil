<script lang="ts">
	import { resolve } from '$app/paths';
	import type { ActionData, PageData } from './$types';

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

<svelte:head><title>Registration application | Tasdjil</title></svelte:head>

<div class="application-page">
	<header class="application-header">
		<div>
			<h1>Registration application</h1>
			<p>Submit or update your application for the current registration session.</p>
		</div>
		{#if data.currentSession}
			<span
				class:session-status--open={data.currentSession.registrationOpened}
				class="session-status"
			>
				{data.currentSession.registrationOpened ? 'Registration open' : 'Registration closed'}
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
			{form.message}
		</p>
	{/if}

	{#if !data.currentSession}
		<p class="alert alert--error">
			No current registration session is configured. Applications are disabled.
		</p>
	{:else if !data.currentSession.registrationOpened}
		<p class="alert alert--error">The current session is closed. The application is read-only.</p>
	{:else if data.application?.isProcessed && data.isOwnApplication}
		<p class="alert alert--info">
			This application has been processed and can no longer be edited.
		</p>
	{/if}

	{#if data.isAdministrator && data.applications.length}
		<section class="application-panel">
			<h2>Applications to review</h2>
			<div class="review-list">
				{#each data.applications as item (item.id)}
					<form method="get">
						<button
							class:review-list__selected={data.application?.id === item.id}
							name="application"
							value={item.id}
						>
							<span>{item.studentName}</span>
							<small>{item.isProcessed ? 'Processed' : 'Pending'}</small>
						</button>
					</form>
				{/each}
			</div>
		</section>
	{/if}

	<form method="post" action="?/save" enctype="multipart/form-data">
		<fieldset disabled={!canEdit}>
			<section class="application-panel">
				<h2>Session</h2>
				<label class="application-field">
					Current session
					<input value={data.currentSession?.nameSession ?? 'No current session'} readonly />
				</label>
			</section>

			<section class="application-panel">
				<h2>Personal information</h2>
				<div class="application-grid">
					<label class="application-field"
						>Last name<input
							name="lastName"
							value={data.application?.lastName ?? ''}
							required
						/></label
					>
					<label class="application-field"
						>First name<input
							name="firstName"
							value={data.application?.firstName ?? ''}
							required
						/></label
					>
					<label class="application-field"
						>Last name (Arabic)<input
							name="lastNameAr"
							value={data.application?.lastNameAr ?? ''}
							dir="rtl"
							required
						/></label
					>
					<label class="application-field"
						>First name (Arabic)<input
							name="firstNameAr"
							value={data.application?.firstNameAr ?? ''}
							dir="rtl"
							required
						/></label
					>
					<label class="application-field"
						>Date of birth<input
							type="date"
							name="dateOfBirth"
							value={data.application?.dateOfBirth ?? ''}
							required
						/></label
					>
					<label class="application-field"
						>Place of birth<input
							name="placeOfBirth"
							value={data.application?.placeOfBirth ?? ''}
							required
						/></label
					>
					<label class="application-field"
						>Phone number<input
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
				<h2>Academic history</h2>
				<div class="application-grid">
					<label class="application-field">
						Establishment
						<select name="establishmentId" value={data.application?.establishmentId} required>
							<option value="" disabled>Select an establishment</option>
							{#each data.establishments as establishment (establishment.id)}
								<option value={establishment.id}>{establishment.name}</option>
							{/each}
						</select>
					</label>
					<label class="application-field"
						>Field of study<input
							name="fieldOfStudy"
							value={data.application?.fieldOfStudy ?? ''}
							required
						/></label
					>
					<label class="application-field"
						>Specialization<input
							name="specialization"
							value={data.application?.specialization ?? ''}
							required
						/></label
					>
					<label class="application-field"
						>Graduation year<input
							type="number"
							name="graduationYear"
							min="1900"
							max="2100"
							value={data.application?.graduationYear ?? ''}
							required
						/></label
					>
					<label class="application-field"
						>Baccalaureate year<input
							type="number"
							name="baccalaureateYear"
							min="1900"
							max="2100"
							value={data.application?.baccalaureateYear ?? ''}
							required
						/></label
					>
					<label class="application-field"
						>Baccalaureate number<input
							name="baccalaureateNumber"
							value={data.application?.baccalaureateNumber ?? ''}
							required
						/></label
					>
					<label class="application-field">
						Educational system
						<select name="educationalSystem" bind:value={selectedSystem} required>
							{#each data.educationalSystems as system (system)}
								<option value={system}>{system}</option>
							{/each}
						</select>
					</label>
				</div>

				<div class="averages">
					{#each Array.from({ length: visibleAverageYears }, (_, index) => index + 1) as year (year)}
						<label class="application-field">
							General average — year {year}
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

				<div class="application-grid">
					<label class="application-field"
						>Admissions after makeup exams<input
							type="number"
							name="admissionsAfterMakeupExamsCount"
							min="0"
							value={data.application?.admissionsAfterMakeupExamsCount ?? 0}
							required
						/></label
					>
					<label class="application-field"
						>Admissions with debts<input
							type="number"
							name="admissionsWithDebtsCount"
							min="0"
							value={data.application?.admissionsWithDebtsCount ?? 0}
							required
						/></label
					>
					<label class="application-field"
						>Repeated years<input
							type="number"
							name="repeatedYearsCount"
							min="0"
							value={data.application?.repeatedYearsCount ?? 0}
							required
						/></label
					>
				</div>
			</section>

			<section class="application-panel">
				<h2>Requested program</h2>
				<div class="application-grid">
					<label class="application-field">
						Requested level
						<select
							name="requestedLevel"
							bind:value={selectedRequestedLevel}
							onchange={resetRequestedProgram}
							required
						>
							<option value="" disabled>Select a level</option>
							{#each data.studyLevels as level (level)}<option value={level}>{level}</option>{/each}
						</select>
					</label>
					<label class="application-field">
						Domaine
						<select
							name="domainId"
							bind:value={selectedDomainId}
							onchange={resetPreferences}
							disabled={!selectedRequestedLevel}
							required
						>
							<option value="" disabled>Select a domaine</option>
							{#each relatedDomains as domain (domain.id)}
								<option value={domain.id}>{domain.name}</option>
							{/each}
						</select>
					</label>
					{#each [1, 2, 3] as preference (preference)}
						<label class="application-field">
							Preference {preference}
							<select
								name={`preference${preference}`}
								bind:value={selectedPreferences[preference - 1]}
								disabled={!selectedDomainId}
								required
							>
								<option value="" disabled>Select a speciality</option>
								{#each relatedSpecialities as speciality (speciality.id)}
									<option value={speciality.id}>{speciality.name}</option>
								{/each}
							</select>
						</label>
					{/each}
					<label class="application-field">
						Supporting attachment
						<input
							type="file"
							name="attachment"
							accept="application/pdf,image/jpeg,image/png,image/webp"
							required={!data.application?.attachment}
						/>
						<small>PDF, JPEG, PNG, or WebP; maximum 10 MB.</small>
						{#if data.application?.attachment}<a
								href={resolve('/registration-application/[id]/attachment', {
									id: String(data.application.id)
								})}
								target="_blank">View current attachment</a
							>{/if}
					</label>
				</div>
			</section>

			{#if canEdit}
				<button class="submit-button" type="submit"
					>{data.application ? 'Update application' : 'Submit application'}</button
				>
			{/if}
		</fieldset>
	</form>

	{#if data.isAdministrator && data.application}
		<section class="application-panel administration-panel">
			<h2>Administration decision</h2>
			<p>This panel is restricted to admin and faculty-admin roles.</p>
			<form class="administration-form" method="post" action="?/process">
				<input type="hidden" name="id" value={data.application.id} />
				<label class="application-field">
					Decision
					<select
						name="isAccepted"
						value={data.application.isProcessed ? String(data.application.isAccepted) : ''}
						required
					>
						<option value="" disabled>Select a decision</option>
						<option value="true">Accepted</option>
						<option value="false">Rejected</option>
					</select>
				</label>
				<label class="application-field administration-form__remark"
					>Remark<textarea name="remark" rows="3">{data.application.remark ?? ''}</textarea></label
				>
				<label class="application-field"
					>Processed<input value={data.application.isProcessed ? 'Yes' : 'No'} readonly /></label
				>
				<button class="submit-button" type="submit">Save decision</button>
			</form>
			<small
				>Saving either acceptance decision automatically marks the application as processed.</small
			>
		</section>
	{/if}
</div>

<style>
	.application-page,
	fieldset {
		display: grid;
		gap: 1.5rem;
	}
	fieldset {
		margin: 0;
		border: 0;
		padding: 0;
	}
	.application-header {
		display: flex;
		align-items: end;
		justify-content: space-between;
		gap: 1rem;
	}
	h1,
	h2 {
		margin: 0;
		color: #0f172a;
	}
	.application-header p,
	.administration-panel p {
		margin: 0.375rem 0 0;
		color: #64748b;
	}
	.session-status {
		border-radius: 999px;
		background: #fee2e2;
		padding: 0.45rem 0.75rem;
		color: #991b1b;
		font-size: 0.8125rem;
		font-weight: 700;
	}
	.session-status--open {
		background: #dcfce7;
		color: #166534;
	}
	.alert {
		margin: 0;
		border-radius: 0.625rem;
		padding: 0.75rem 1rem;
	}
	.alert--error {
		background: #fef2f2;
		color: #b91c1c;
	}
	.alert--success {
		background: #f0fdf4;
		color: #166534;
	}
	.alert--info {
		background: #eff6ff;
		color: #1d4ed8;
	}
	.application-panel {
		border: 1px solid #e2e8f0;
		border-radius: 0.875rem;
		background: white;
		padding: 1.5rem;
	}
	.application-panel h2 {
		margin-bottom: 1rem;
		font-size: 1.125rem;
	}
	.application-grid,
	.averages,
	.administration-form {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 1rem;
	}
	.averages {
		margin: 1rem 0;
	}
	.application-field {
		display: grid;
		align-content: start;
		gap: 0.375rem;
		color: #334155;
		font-size: 0.8125rem;
		font-weight: 600;
	}
	.application-field input,
	.application-field select,
	.application-field textarea {
		width: 100%;
		box-sizing: border-box;
		border: 1px solid #cbd5e1;
		border-radius: 0.5rem;
		background: white;
		padding: 0.625rem 0.75rem;
		color: #0f172a;
		font: inherit;
	}
	.application-field input:focus,
	.application-field select:focus,
	.application-field textarea:focus {
		border-color: #2563eb;
		outline: 3px solid rgb(37 99 235 / 15%);
	}
	.application-field small {
		color: #64748b;
		font-weight: 400;
	}
	.application-field a {
		color: #1d4ed8;
	}
	fieldset:disabled {
		opacity: 0.72;
	}
	.submit-button {
		justify-self: start;
		border: 0;
		border-radius: 0.5rem;
		background: #2563eb;
		padding: 0.75rem 1.25rem;
		color: white;
		cursor: pointer;
		font: inherit;
		font-weight: 700;
	}
	.administration-panel {
		border-color: #c4b5fd;
		background: #faf5ff;
	}
	.administration-form__remark {
		grid-column: span 2;
	}
	.administration-panel > small {
		display: block;
		margin-top: 0.75rem;
		color: #6b21a8;
	}
	.review-list {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}
	.review-list button {
		display: grid;
		width: 100%;
		gap: 0.125rem;
		border: 1px solid #cbd5e1;
		border-radius: 0.5rem;
		background: white;
		padding: 0.5rem 0.75rem;
		color: #334155;
		cursor: pointer;
		font: inherit;
		text-align: start;
		text-decoration: none;
	}
	.review-list button:hover,
	.review-list__selected {
		border-color: #2563eb !important;
		background: #eff6ff;
	}
	.review-list small {
		color: #64748b;
	}
	@media (max-width: 50rem) {
		.application-grid,
		.averages,
		.administration-form {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
	@media (max-width: 36rem) {
		.application-header {
			display: grid;
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
