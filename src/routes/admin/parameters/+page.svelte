<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<svelte:head><title>Global parameters | Tasdjil Admin</title></svelte:head>

<div class="admin-page">
	<header class="admin-page__header">
		<div>
			<h1>Global parameters</h1>
			<p>Configure application-wide settings.</p>
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
		<h2>Registration</h2>
		<form class="entity-form entity-form--parameters" method="post" use:enhance>
			<label class="entity-form__field">
				Current session
				<select name="currentSessionId" value={data.currentSessionId ?? ''}>
					<option value="">No current session</option>
					{#each data.sessions as session (session.id)}
						<option value={session.id}>
							{session.nameSession} ({session.startRegistrationsDate} – {session.endRegistrationsDate})
						</option>
					{/each}
				</select>
			</label>
			<button type="submit">Save parameters</button>
		</form>

		{#if !data.sessions.length}
			<p class="admin-panel__empty">Create a session before selecting a current session.</p>
		{/if}
	</section>
</div>
