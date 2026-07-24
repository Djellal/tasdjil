<script lang="ts">
	import type { Pathname } from '$app/types';
	import { base, resolve } from '$app/paths';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import * as m from '$lib/paraglide/messages.js';
	import { baseLocale, extractLocaleFromUrl, locales, localizeHref } from '$lib/paraglide/runtime';
	import './layout.css';
	import type { LayoutData } from './$types';
	import {
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
	const ufasLogo = `${base}/logo-ufas.svg`;
	const localizedPath = (path: Pathname) => resolve(localizeHref(path, { locale }) as Pathname);
	const formatDate = (date: string) =>
		new Intl.DateTimeFormat(locale, { day: '2-digit', month: 'short', year: 'numeric' }).format(
			new Date(`${date}T00:00:00`)
		);
	const switchLanguage = (event: MouseEvent, language: (typeof locales)[number]) => {
		event.preventDefault();
		if (language !== locale) {
			void goto(resolve(localizeHref(page.url.pathname, { locale: language }) as Pathname));
		}
	};

	$effect(() => {
		document.documentElement.lang = locale;
		document.documentElement.dir = direction;
	});
</script>

<svelte:head><link rel="icon" href={ufasLogo} /></svelte:head>

<div class="site-shell" lang={locale} dir={direction}>
	<header class="site-header">
		<div class="site-header__content">
			<a class="brand" href={localizedPath('/')} aria-label={m.layout_home_aria()}>
				<span class="brand__mark" aria-hidden="true"><img src={ufasLogo} alt="" /></span>
				<span>Tasdjil</span>
			</a>

			<nav class="main-nav" aria-label={m.layout_main_navigation()}>
				<a href={localizedPath('/')}><Home size={16} /> {m.layout_home()}</a>
				{#if data.user}
					<div class="nav-menu applications-menu">
						<button class="nav-menu__toggle" aria-haspopup="true">
							<ClipboardList size={16} />
							{m.layout_applications()}
							<ChevronDown size={14} />
						</button>
						<div class="nav-menu__submenu">
							<span class="nav-menu__label">{m.layout_registration()}</span>
							<a href={localizedPath('/registration-application')}>
								<FileText size={16} />
								<span
									><strong>{m.layout_my_application()}</strong><small
										>{m.layout_my_application_description()}</small
									></span
								>
							</a>
							{#if data.user.role === 'admin' || data.user.role === 'adminfac'}
								<a href={localizedPath('/admin/registration-applications')}>
									<ClipboardList size={16} />
									<span
										><strong>{m.layout_registration_applications()}</strong><small
											>{m.layout_registration_applications_description()}</small
										></span
									>
								</a>
							{/if}
						</div>
					</div>
					{#if data.user.role === 'admin'}
						<div class="nav-menu admin-menu">
							<button class="nav-menu__toggle" aria-haspopup="true">
								<Shield size={16} />
								{m.layout_admin()}
								<ChevronDown size={14} />
							</button>
							<div class="nav-menu__submenu admin-menu__submenu">
								<span class="nav-menu__label">{m.layout_administration()}</span>
								<a href={localizedPath('/admin/users')}><Users size={16} /> {m.layout_users()}</a>
								<a href={localizedPath('/admin/parameters')}
									><Settings size={16} /> {m.layout_parameters()}</a
								>
								<a href={localizedPath('/admin/sessions')}
									><Calendar size={16} /> {m.layout_sessions()}</a
								>
								<a href={localizedPath('/admin/establishments')}
									><Building2 size={16} /> {m.layout_establishments()}</a
								>
								<a href={localizedPath('/admin/faculties')}
									><School size={16} /> {m.layout_faculties()}</a
								>
								<a href={localizedPath('/admin/domaines')}
									><FolderOpen size={16} /> {m.layout_domains()}</a
								>
								<a href={localizedPath('/admin/specialities')}
									><Sparkles size={16} /> {m.layout_specialities()}</a
								>
							</div>
						</div>
					{:else if data.user.role === 'adminfac'}
						<div class="nav-menu admin-menu">
							<button class="nav-menu__toggle" aria-haspopup="true">
								<Shield size={16} />
								{m.layout_faculty_admin()}
								<ChevronDown size={14} />
							</button>
							<div class="nav-menu__submenu admin-menu__submenu">
								<span class="nav-menu__label">{m.layout_faculty_administration()}</span>
								<a href={localizedPath('/admin/faculties')}
									><School size={16} /> {m.layout_my_faculty()}</a
								>
								<a href={localizedPath('/admin/domaines')}
									><FolderOpen size={16} /> {m.layout_domains()}</a
								>
								<a href={localizedPath('/admin/specialities')}
									><Sparkles size={16} /> {m.layout_specialities()}</a
								>
							</div>
						</div>
					{/if}
					<div class="nav-menu account-menu">
						<button class="nav-menu__toggle account-menu__toggle" aria-haspopup="true">
							<span class="account-menu__avatar"><User size={15} /></span>
							<span class="main-nav__user">{data.user.name}</span>
							<ChevronDown size={14} />
						</button>
						<div class="nav-menu__submenu account-menu__submenu">
							<span class="nav-menu__label">{m.layout_account()}</span>
							<form method="post" action={localizedPath('/logout')}>
								<button type="submit"><LogOut size={16} /> {m.layout_sign_out()}</button>
							</form>
						</div>
					</div>
				{:else}
					<a href={localizedPath('/login')}><LogIn size={16} /> {m.layout_sign_in()}</a>
					<a class="main-nav__primary" href={localizedPath('/register')}
						><UserPlus size={16} /> {m.layout_create_account()}</a
					>
				{/if}
				<div class="nav-menu language-menu">
					<button
						class="nav-menu__toggle language-menu__toggle"
						aria-label={m.layout_change_language()}
						aria-haspopup="true"
					>
						<Globe size={16} /> <span class="language-menu__name">{languageNames[locale]}</span>
						<ChevronDown size={14} />
					</button>
					<div class="nav-menu__submenu language-menu__submenu">
						<span class="nav-menu__label">{m.layout_language()}</span>
						{#each locales as language (language)}
							<a
								href={resolve(localizeHref(page.url.pathname, { locale: language }) as Pathname)}
								hreflang={language}
								lang={language}
								aria-current={language === locale ? 'page' : undefined}
								onclick={(event) => switchLanguage(event, language)}
							>
								{languageNames[language]}
							</a>
						{/each}
					</div>
				</div>
			</nav>
		</div>
	</header>

	<main class="site-main">
		{@render children()}
	</main>

	<footer class="site-footer">
		<div class="site-footer__content">
			<div class="site-footer__brand">
				<img src={ufasLogo} alt="" aria-hidden="true" />
				<div>
					<p>&copy; {new Date().getFullYear()} Tasdjil</p>
					<small>{m.layout_footer_tagline()}</small>
				</div>
			</div>
			{#if data.currentSession}
				<div class="site-footer__session">
					<div>
						<span>{m.layout_footer_current_session()}</span>
						<strong>{data.currentSession.nameSession}</strong>
					</div>
					<div>
						<span>{m.layout_footer_registration_period()}</span>
						<strong
							>{formatDate(data.currentSession.startRegistrationsDate)} – {formatDate(
								data.currentSession.endRegistrationsDate
							)}</strong
						>
					</div>
					<span class:session-open={data.currentSession.registrationOpened} class="footer-status">
						{data.currentSession.registrationOpened
							? m.layout_footer_registration_open()
							: m.layout_footer_registration_closed()}
					</span>
				</div>
			{/if}
		</div>
	</footer>
</div>
