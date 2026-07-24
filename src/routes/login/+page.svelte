<script lang="ts">
	import { enhance } from '$app/forms';
	import type { Pathname } from '$app/types';
	import { resolve } from '$app/paths';
	import { localizeHref } from '$lib/paraglide/runtime';
	import * as m from '$lib/paraglide/messages.js';
	import type { ActionData } from './$types';
	import { Mail, Lock, LogIn, UserPlus, AlertCircle } from '@lucide/svelte';

	let { form }: { form: ActionData } = $props();
</script>

<svelte:head><title>{m.login_meta_title()}</title></svelte:head>

<section class="auth-card">
	<h1>{m.login_title()}</h1>
	<p class="auth-card__intro">{m.login_intro()}</p>

	<form class="auth-form" method="post" use:enhance>
		<label class="auth-field">
			<Mail size={14} /> {m.login_email_label()}
			<input type="email" name="email" value={form?.email ?? ''} autocomplete="email" required />
		</label>

		<label class="auth-field">
			<Lock size={14} /> {m.login_password_label()}
			<input type="password" name="password" autocomplete="current-password" required />
		</label>

		{#if form?.message}
			<p class="auth-form__error" role="alert"><AlertCircle size={16} /> {form.message}</p>
		{/if}

		<button type="submit"><LogIn size={16} /> {m.login_submit()}</button>
	</form>

	<p class="auth-card__footer">
		{m.login_new()}
		<a href={resolve(localizeHref('/register') as Pathname)}><UserPlus size={14} /> {m.login_register()}</a>
	</p>
</section>
