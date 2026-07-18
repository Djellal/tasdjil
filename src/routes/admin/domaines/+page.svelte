<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
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

		{#if data.domaines.length}
			<div class="entity-list">
				{#each data.domaines as savedDomaine (savedDomaine.id)}
					<div class="entity-row">
						<form
							class="entity-form entity-form--domaine"
							method="post"
							action="?/update"
							use:enhance
						>
							<input type="hidden" name="id" value={savedDomaine.id} />
							<label class="entity-form__field">
								Faculty
								<select name="facultyId" value={savedDomaine.facultyId} required>
									{#each data.faculties as faculty (faculty.id)}
										<option value={faculty.id}>{faculty.name}</option>
									{/each}
								</select>
							</label>
							<label class="entity-form__field">
								Study level
								<select name="studyLevel" value={savedDomaine.studyLevel} required>
									{#each data.studyLevels as level (level)}
										<option value={level}>{level}</option>
									{/each}
								</select>
							</label>
							<label class="entity-form__field">
								Name
								<input type="text" name="name" value={savedDomaine.name} required />
							</label>
							<label class="entity-form__field">
								Arabic name
								<input type="text" name="nameAr" value={savedDomaine.nameAr} dir="rtl" required />
							</label>
							<button type="submit">Save</button>
						</form>

						<form class="entity-row__delete" method="post" action="?/delete" use:enhance>
							<input type="hidden" name="id" value={savedDomaine.id} />
							<button type="submit" aria-label={`Delete ${savedDomaine.name}`}>Delete</button>
						</form>
					</div>
				{/each}
			</div>
		{:else}
			<p class="admin-panel__empty">No domaines have been added yet.</p>
		{/if}
	</section>
</div>
