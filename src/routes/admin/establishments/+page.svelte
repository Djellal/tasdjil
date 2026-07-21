<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<svelte:head><title>Establishments | Tasdjil Admin</title></svelte:head>

<div class="admin-page">
	<header class="admin-page__header">
		<div>
			<h1>Establishments</h1>
			<p>Create and manage establishment names in French and Arabic.</p>
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
		<h2>Add establishment</h2>
		<form class="faculty-form" method="post" action="?/create" use:enhance>
			<label class="faculty-form__field">
				Name
				<input type="text" name="name" autocomplete="off" required />
			</label>
			<label class="faculty-form__field">
				Arabic name
				<input type="text" name="nameAr" dir="rtl" autocomplete="off" required />
			</label>
			<button type="submit">Add establishment</button>
		</form>
	</section>

	<section class="admin-panel">
		<h2>Existing establishments ({data.establishments.length})</h2>

		{#if data.establishments.length}
			<div class="faculty-list">
				{#each data.establishments as establishment (establishment.id)}
					<div class="faculty-row">
						<form class="faculty-form" method="post" action="?/update" use:enhance>
							<input type="hidden" name="id" value={establishment.id} />
							<label class="faculty-form__field">
								Name
								<input type="text" name="name" value={establishment.name} required />
							</label>
							<label class="faculty-form__field">
								Arabic name
								<input type="text" name="nameAr" value={establishment.nameAr} dir="rtl" required />
							</label>
							<button type="submit">Save</button>
						</form>

						<form class="faculty-row__delete" method="post" action="?/delete" use:enhance>
							<input type="hidden" name="id" value={establishment.id} />
							<button type="submit" aria-label={`Delete ${establishment.name}`}>Delete</button>
						</form>
					</div>
				{/each}
			</div>
		{:else}
			<p class="admin-panel__empty">No establishments have been added yet.</p>
		{/if}
	</section>
</div>
