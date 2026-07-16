<script lang="ts">
	import type { Pathname } from '$app/types';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { locales, localizeHref } from '$lib/paraglide/runtime';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import type { LayoutData } from './$types';

	let { children, data }: { children: import('svelte').Snippet; data: LayoutData } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<div class="site-shell">
	<header class="site-header">
		<div class="site-header__content">
			<a class="brand" href={resolve('/')} aria-label="Tasdjil home">
				<span class="brand__mark" aria-hidden="true">T</span>
				<span>Tasdjil</span>
			</a>

			<nav class="main-nav" aria-label="Main navigation">
				<a href={resolve('/')}>Home</a>
				{#if data.user}
					{#if data.user.role === 'admin'}
						<details class="admin-menu">
							<summary>Admin</summary>
							<div class="admin-menu__submenu">
								<a href={resolve('/admin/faculties')}>Faculties</a>
							</div>
						</details>
					{/if}
					<span class="main-nav__user">{data.user.name}</span>
					<form method="post" action={resolve('/logout')}>
						<button type="submit">Sign out</button>
					</form>
				{:else}
					<a href={resolve('/login')}>Sign in</a>
					<a class="main-nav__primary" href={resolve('/register')}>Create account</a>
				{/if}
			</nav>
		</div>
	</header>

	<main class="site-main">
		{@render children()}
	</main>

	<footer class="site-footer">
		<div class="site-footer__content">
			<p>&copy; {new Date().getFullYear()} Tasdjil</p>
			<p>Simple, secure registration.</p>
		</div>
	</footer>
</div>

<div style="display:none">
	{#each locales as locale (locale)}
		<a href={resolve(localizeHref(page.url.pathname, { locale }) as Pathname)}>{locale}</a>
	{/each}
</div>
