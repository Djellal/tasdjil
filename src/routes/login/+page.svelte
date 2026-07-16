<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<svelte:head><title>Sign in | Tasdjil</title></svelte:head>

<section class="auth-card">
	<h1>Welcome back</h1>
	<p class="auth-card__intro">Sign in to continue to your Tasdjil account.</p>

	<form class="auth-form" method="post" use:enhance>
		<label class="auth-field">
			Email address
			<input type="email" name="email" value={form?.email ?? ''} autocomplete="email" required />
		</label>

		<label class="auth-field">
			Password
			<input type="password" name="password" autocomplete="current-password" required />
		</label>

		{#if form?.message}
			<p class="auth-form__error" role="alert">{form.message}</p>
		{/if}

		<button type="submit">Sign in</button>
	</form>

	<p class="auth-card__footer">
		New to Tasdjil? <a href={resolve('/register')}>Create an account</a>
	</p>
</section>
