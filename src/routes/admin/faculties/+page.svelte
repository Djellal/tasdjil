<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<svelte:head><title>Faculties | Tasdjil Admin</title></svelte:head>

<div class="admin-page">
	<header class="admin-page__header">
		<div>
			<h1>Faculties</h1>
			<p>Create and manage faculty names in French and Arabic.</p>
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
		<h2>Add faculty</h2>
		<form class="faculty-form" method="post" action="?/create" use:enhance>
			<label class="faculty-form__field">
				Name
				<input type="text" name="name" autocomplete="off" required />
			</label>
			<label class="faculty-form__field">
				Arabic name
				<input type="text" name="nameAr" dir="rtl" autocomplete="off" required />
			</label>
			<button type="submit">Add faculty</button>
		</form>
	</section>

	<section class="admin-panel">
		<h2>Existing faculties ({data.faculties.length})</h2>

		{#if data.faculties.length}
			<div class="faculty-list">
				{#each data.faculties as faculty (faculty.id)}
					<div class="faculty-row">
						<form class="faculty-form" method="post" action="?/update" use:enhance>
							<input type="hidden" name="id" value={faculty.id} />
							<label class="faculty-form__field">
								Name
								<input type="text" name="name" value={faculty.name} required />
							</label>
							<label class="faculty-form__field">
								Arabic name
								<input type="text" name="nameAr" value={faculty.nameAr} dir="rtl" required />
							</label>
							<button type="submit">Save</button>
						</form>

						<form class="faculty-row__delete" method="post" action="?/delete" use:enhance>
							<input type="hidden" name="id" value={faculty.id} />
							<button type="submit" aria-label={`Delete ${faculty.name}`}>Delete</button>
						</form>
					</div>
				{/each}
			</div>
		{:else}
			<p class="admin-panel__empty">No faculties have been added yet.</p>
		{/if}
	</section>
</div>
