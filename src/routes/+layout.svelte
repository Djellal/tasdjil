<script lang="ts">
	import type { Pathname } from '$app/types';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { baseLocale, extractLocaleFromUrl, locales, localizeHref } from '$lib/paraglide/runtime';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import type { LayoutData } from './$types';
	import {
		GraduationCap,
		Home,
		Globe,
		ChevronDown,
		FileText,
		Shield,
		Users,
		ClipboardList,
		Settings,
		Calendar,
		Building2,
		School,
		FolderOpen,
		Sparkles,
		LogIn,
		UserPlus,
		LogOut,
		User
	} from '@lucide/svelte';

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
				<span class="brand__mark" aria-hidden="true"><GraduationCap size={20} /></span>
				<span>Tasdjil</span>
			</a>

			<nav class="main-nav" aria-label="Main navigation">
				<a href={localizedPath('/')}><Home size={16} /> Home</a>
				<div class="language-menu">
					<button class="language-menu__toggle" aria-label="Change language">
						<Globe size={16} /> {languageNames[locale]} <ChevronDown size={14} />
					</button>
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
				</div>
				{#if data.user}
					<a href={localizedPath('/registration-application')}><FileText size={16} /> Application</a>
					{#if data.user.role === 'admin'}
						<div class="admin-menu">
							<button class="admin-menu__toggle">
								<Shield size={16} /> Admin <ChevronDown size={14} />
							</button>
							<div class="admin-menu__submenu">
								<a href={localizedPath('/admin/users')}><Users size={16} /> Users</a>
								<a href={localizedPath('/admin/registration-applications')}><ClipboardList size={16} /> Applications</a>
								<a href={localizedPath('/admin/parameters')}><Settings size={16} /> Parameters</a>
								<a href={localizedPath('/admin/sessions')}><Calendar size={16} /> Sessions</a>
								<a href={localizedPath('/admin/establishments')}><Building2 size={16} /> Establishments</a>
								<a href={localizedPath('/admin/faculties')}><School size={16} /> Faculties</a>
								<a href={localizedPath('/admin/domaines')}><FolderOpen size={16} /> Domaines</a>
								<a href={localizedPath('/admin/specialities')}><Sparkles size={16} /> Specialities</a>
							</div>
						</div>
					{:else if data.user.role === 'adminfac'}
						<div class="admin-menu">
							<button class="admin-menu__toggle">
								<Shield size={16} /> Faculty Admin <ChevronDown size={14} />
							</button>
							<div class="admin-menu__submenu">
								<a href={localizedPath('/admin/registration-applications')}><ClipboardList size={16} /> Applications</a>
								<a href={localizedPath('/admin/faculties')}><School size={16} /> My Faculty</a>
								<a href={localizedPath('/admin/domaines')}><FolderOpen size={16} /> Domaines</a>
								<a href={localizedPath('/admin/specialities')}><Sparkles size={16} /> Specialities</a>
							</div>
						</div>
					{/if}
					<span class="main-nav__user"><User size={16} /> {data.user.name}</span>
					<form method="post" action={localizedPath('/logout')}>
						<button type="submit"><LogOut size={16} /> Sign out</button>
					</form>
				{:else}
					<a href={localizedPath('/login')}><LogIn size={16} /> Sign in</a>
					<a class="main-nav__primary" href={localizedPath('/register')}><UserPlus size={16} /> Create account</a>
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
