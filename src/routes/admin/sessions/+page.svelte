<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<svelte:head><title>Sessions | Tasdjil Admin</title></svelte:head>

<div class="admin-page">
	<header class="admin-page__header">
		<div>
			<h1>Sessions</h1>
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
			<button type="submit">Add session</button>
		</form>
	</section>

	<section class="admin-panel">
		<h2>Existing sessions ({data.sessions.length})</h2>

		{#if data.sessions.length}
			<div class="entity-list">
				{#each data.sessions as session (session.id)}
					<div class="entity-row">
						<form
							class="entity-form entity-form--session"
							method="post"
							action="?/update"
							use:enhance
						>
							<input type="hidden" name="id" value={session.id} />
							<label class="entity-form__field">
								Session name
								<input type="text" name="nameSession" value={session.nameSession} required />
							</label>
							<label class="entity-form__field">
								Registration starts
								<input
									type="date"
									name="startRegistrationsDate"
									value={session.startRegistrationsDate}
									required
								/>
							</label>
							<label class="entity-form__field">
								Registration ends
								<input
									type="date"
									name="endRegistrationsDate"
									value={session.endRegistrationsDate}
									required
								/>
							</label>
							<label class="entity-form__field">
								Registration status
								<select
									name="registrationOpened"
									value={String(session.registrationOpened)}
									required
								>
									<option value="false">Closed</option>
									<option value="true">Open</option>
								</select>
							</label>
							<button type="submit">Save</button>
						</form>

						<form class="entity-row__delete" method="post" action="?/delete" use:enhance>
							<input type="hidden" name="id" value={session.id} />
							<button type="submit" aria-label={`Delete ${session.nameSession}`}>Delete</button>
						</form>
					</div>
				{/each}
			</div>
		{:else}
			<p class="admin-panel__empty">No sessions have been added yet.</p>
		{/if}
	</section>
</div>
