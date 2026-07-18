<script lang="ts">
	import type { Pathname } from '$app/types';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { baseLocale, extractLocaleFromUrl, locales, localizeHref } from '$lib/paraglide/runtime';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import type { LayoutData } from './$types';

	let { children, data }: { children: import('svelte').Snippet; data: LayoutData } = $props();
	let locale = $derived(extractLocaleFromUrl(page.url) ?? baseLocale);
	let direction: 'rtl' | 'ltr' = $derived(locale === 'ar' ? 'rtl' : 'ltr');
	const languageNames = {
		ar: 'العربية',
		fr: 'Français',
		en: 'English'
	};
	const localizedPath = (path: Pathname) => resolve(localizeHref(path, { locale }) as Pathname);

	$effect(() => {
		document.documentElement.lang = locale;
		document.documentElement.dir = direction;
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<div class="site-shell" lang={locale} dir={direction}>
	<header class="site-header">
		<div class="site-header__content">
			<a class="brand" href={localizedPath('/')} aria-label="Tasdjil home">
				<span class="brand__mark" aria-hidden="true">T</span>
				<span>Tasdjil</span>
			</a>

			<nav class="main-nav" aria-label="Main navigation">
				<a href={localizedPath('/')}>Home</a>
				<details class="language-menu">
					<summary aria-label="Change language">{languageNames[locale]}</summary>
					<div class="language-menu__submenu">
						{#each locales as language (language)}
							<a
								href={resolve(localizeHref(page.url.pathname, { locale: language }) as Pathname)}
								hreflang={language}
								lang={language}
								aria-current={language === locale ? 'page' : undefined}
							>
								{languageNames[language]}
							</a>
						{/each}
					</div>
				</details>
				{#if data.user}
					{#if data.user.role === 'admin'}
						<details class="admin-menu">
							<summary>Admin</summary>
							<div class="admin-menu__submenu">
								<a href={localizedPath('/admin/faculties')}>Faculties</a>
								<a href={localizedPath('/admin/domaines')}>Domaines</a>
								<a href={localizedPath('/admin/specialities')}>Specialities</a>
							</div>
						</details>
					{/if}
					<span class="main-nav__user">{data.user.name}</span>
					<form method="post" action={localizedPath('/logout')}>
						<button type="submit">Sign out</button>
					</form>
				{:else}
					<a href={localizedPath('/login')}>Sign in</a>
					<a class="main-nav__primary" href={localizedPath('/register')}>Create account</a>
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
