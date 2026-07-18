<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<svelte:head><title>Specialities | Tasdjil Admin</title></svelte:head>

<div class="admin-page">
	<header class="admin-page__header">
		<div>
			<h1>Specialities</h1>
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
				<button type="submit">Add speciality</button>
			</form>
		{:else}
			<p class="admin-panel__empty">Add a domaine before creating a speciality.</p>
		{/if}
	</section>

	<section class="admin-panel">
		<h2>Existing specialities ({data.specialities.length})</h2>

		{#if data.specialities.length}
			<div class="entity-list">
				{#each data.specialities as savedSpeciality (savedSpeciality.id)}
					<div class="entity-row">
						<form
							class="entity-form entity-form--speciality"
							method="post"
							action="?/update"
							use:enhance
						>
							<input type="hidden" name="id" value={savedSpeciality.id} />
							<label class="entity-form__field">
								Domaine
								<select name="domaineId" value={savedSpeciality.domaineId} required>
									{#each data.domaines as savedDomaine (savedDomaine.id)}
										<option value={savedDomaine.id}>
											{savedDomaine.name} — {savedDomaine.studyLevel} — {savedDomaine.facultyName}
										</option>
									{/each}
								</select>
							</label>
							<label class="entity-form__field">
								Name
								<input type="text" name="name" value={savedSpeciality.name} required />
							</label>
							<label class="entity-form__field">
								Arabic name
								<input
									type="text"
									name="nameAr"
									value={savedSpeciality.nameAr}
									dir="rtl"
									required
								/>
							</label>
							<button type="submit">Save</button>
						</form>

						<form class="entity-row__delete" method="post" action="?/delete" use:enhance>
							<input type="hidden" name="id" value={savedSpeciality.id} />
							<button type="submit" aria-label={`Delete ${savedSpeciality.name}`}>Delete</button>
						</form>
					</div>
				{/each}
			</div>
		{:else}
			<p class="admin-panel__empty">No specialities have been added yet.</p>
		{/if}
	</section>
</div>
