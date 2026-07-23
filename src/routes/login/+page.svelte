<script lang="ts">
	import { enhance } from '$app/forms';
	import type { Pathname } from '$app/types';
	import { resolve } from '$app/paths';
	import { localizeHref } from '$lib/paraglide/runtime';
	import type { ActionData } from './$types';
	import { Mail, Lock, LogIn, UserPlus, AlertCircle } from '@lucide/svelte';

	let { form }: { form: ActionData } = $props();
</script>

<svelte:head><title>Sign in | Tasdjil</title></svelte:head>

<section class="auth-card">
	<h1>Welcome back</h1>
	<p class="auth-card__intro">Sign in to continue to your Tasdjil account.</p>

	<form class="auth-form" method="post" use:enhance>
		<label class="auth-field">
			<Mail size={14} /> Email address
			<input type="email" name="email" value={form?.email ?? ''} autocomplete="email" required />
		</label>

		<label class="auth-field">
			<Lock size={14} /> Password
			<input type="password" name="password" autocomplete="current-password" required />
		</label>

		{#if form?.message}
			<p class="auth-form__error" role="alert"><AlertCircle size={16} /> {form.message}</p>
		{/if}

		<button type="submit"><LogIn size={16} /> Sign in</button>
	</form>

	<p class="auth-card__footer">
		New to Tasdjil?
		<a href={resolve(localizeHref('/register') as Pathname)}><UserPlus size={14} /> Create an account</a>
	</p>
</section>
