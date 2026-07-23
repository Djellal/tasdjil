<script lang="ts">
	import { enhance } from '$app/forms';
	import type { Pathname } from '$app/types';
	import { resolve } from '$app/paths';
	import { localizeHref } from '$lib/paraglide/runtime';
	import type { ActionData } from './$types';
	import { User, Mail, Lock, ShieldCheck, UserPlus, LogIn, AlertCircle, Info } from '@lucide/svelte';

	let { form }: { form: ActionData } = $props();
</script>

<svelte:head><title>Create account | Tasdjil</title></svelte:head>

<section class="auth-card">
	<h1>Create your account</h1>
	<p class="auth-card__intro">Register as a student to get started.</p>

	<form class="auth-form" method="post" use:enhance>
		<label class="auth-field">
			<User size={14} /> Full name
			<input type="text" name="name" value={form?.name ?? ''} autocomplete="name" required />
		</label>

		<label class="auth-field">
			<Mail size={14} /> Email address
			<input type="email" name="email" value={form?.email ?? ''} autocomplete="email" required />
		</label>

		<label class="auth-field">
			<Lock size={14} /> Password
			<input type="password" name="password" autocomplete="new-password" minlength="8" required />
		</label>
		<p class="auth-form__hint"><Info size={12} /> Use at least 8 characters.</p>

		<label class="auth-field">
			<ShieldCheck size={14} /> Confirm password
			<input
				type="password"
				name="confirmPassword"
				autocomplete="new-password"
				minlength="8"
				required
			/>
		</label>

		{#if form?.message}
			<p class="auth-form__error" role="alert"><AlertCircle size={16} /> {form.message}</p>
		{/if}

		<button type="submit"><UserPlus size={16} /> Create student account</button>
	</form>

	<p class="auth-card__footer">
		Already have an account? <a href={resolve(localizeHref('/login') as Pathname)}><LogIn size={14} /> Sign in</a>
	</p>
</section>
