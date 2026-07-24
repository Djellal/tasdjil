<script lang="ts">
	import { enhance } from '$app/forms';
	import type { Pathname } from '$app/types';
	import { resolve } from '$app/paths';
	import { localizeHref } from '$lib/paraglide/runtime';
	import * as m from '$lib/paraglide/messages.js';
	import type { ActionData } from './$types';
	import { User, Mail, Lock, ShieldCheck, UserPlus, LogIn, AlertCircle, Info } from '@lucide/svelte';

	let { form }: { form: ActionData } = $props();
</script>

<svelte:head><title>{m.register_meta_title()}</title></svelte:head>

<section class="auth-card">
	<h1>{m.register_title()}</h1>
	<p class="auth-card__intro">{m.register_intro()}</p>

	<form class="auth-form" method="post" use:enhance>
		<label class="auth-field">
			<User size={14} /> {m.register_name_label()}
			<input type="text" name="name" value={form?.name ?? ''} autocomplete="name" required />
		</label>

		<label class="auth-field">
			<Mail size={14} /> {m.register_email_label()}
			<input type="email" name="email" value={form?.email ?? ''} autocomplete="email" required />
		</label>

		<label class="auth-field">
			<Lock size={14} /> {m.register_password_label()}
			<input type="password" name="password" autocomplete="new-password" minlength="8" required />
		</label>
		<p class="auth-form__hint"><Info size={12} /> {m.register_password_hint()}</p>

		<label class="auth-field">
			<ShieldCheck size={14} /> {m.register_confirm_label()}
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

		<button type="submit"><UserPlus size={16} /> {m.register_submit()}</button>
	</form>

	<p class="auth-card__footer">
		{m.register_login()} <a href={resolve(localizeHref('/login') as Pathname)}><LogIn size={14} /> {m.register_sign_in()}</a>
	</p>
</section>
