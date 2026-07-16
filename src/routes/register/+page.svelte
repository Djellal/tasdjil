<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<svelte:head><title>Create account | Tasdjil</title></svelte:head>

<section class="auth-card">
	<h1>Create your account</h1>
	<p class="auth-card__intro">Register as a student to get started.</p>

	<form class="auth-form" method="post" use:enhance>
		<label class="auth-field">
			Full name
			<input type="text" name="name" value={form?.name ?? ''} autocomplete="name" required />
		</label>

		<label class="auth-field">
			Email address
			<input type="email" name="email" value={form?.email ?? ''} autocomplete="email" required />
		</label>

		<label class="auth-field">
			Password
			<input type="password" name="password" autocomplete="new-password" minlength="8" required />
		</label>
		<p class="auth-form__hint">Use at least 8 characters.</p>

		<label class="auth-field">
			Confirm password
			<input
				type="password"
				name="confirmPassword"
				autocomplete="new-password"
				minlength="8"
				required
			/>
		</label>

		{#if form?.message}
			<p class="auth-form__error" role="alert">{form.message}</p>
		{/if}

		<button type="submit">Create student account</button>
	</form>

	<p class="auth-card__footer">
		Already have an account? <a href={resolve('/login')}>Sign in</a>
	</p>
</section>
