<script lang="ts">
	import type { Pathname } from '$app/types';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import * as m from '$lib/paraglide/messages.js';
	import { baseLocale, extractLocaleFromUrl, localizeHref } from '$lib/paraglide/runtime';
	import type { PageData } from './$types';
	import {
		ArrowRight,
		CalendarDays,
		Check,
		Circle,
		ClipboardCheck,
		FileText,
		GraduationCap,
		UserPlus
	} from '@lucide/svelte';

	let { data }: { data: PageData } = $props();
	let locale = $derived(extractLocaleFromUrl(page.url) ?? baseLocale);
	let registrationOpen = $derived(Boolean(data.currentSession?.registrationOpened));
	let sessionStatus = $derived(
		!data.currentSession
			? m.home_status_unavailable()
			: registrationOpen
				? m.home_status_open()
				: m.home_status_closed()
	);
	let registrationDates = $derived(
		data.currentSession
			? formatDateRange(
					data.currentSession.startRegistrationsDate,
					data.currentSession.endRegistrationsDate,
					locale
				)
			: m.home_registration_dates_unavailable()
	);

	const localizedPath = (path: Pathname) => resolve(localizeHref(path) as Pathname);

	function formatDateRange(start: string, end: string, language: typeof locale) {
		const localeNames = { ar: 'ar-DZ', fr: 'fr-DZ', en: 'en-GB' } as const;
		const formatter = new Intl.DateTimeFormat(localeNames[language], {
			day: 'numeric',
			month: 'long',
			year: 'numeric',
			timeZone: 'UTC'
		});
		return formatter.formatRange(new Date(`${start}T00:00:00Z`), new Date(`${end}T00:00:00Z`));
	}
</script>

<svelte:head>
	<title>{m.home_meta_title()}</title>
</svelte:head>

<div class="home-page">
	<section class="hero" aria-labelledby="home-title">
		<div class="hero__content">
			<p class="eyebrow"><GraduationCap size={17} /> {m.home_university()}</p>
			<div class="hero__meta">
				<p class="hero__year">{data.currentSession?.nameSession ?? m.home_admissions_year()}</p>
				<span class:session-status--open={registrationOpen} class="session-status">
					<Circle size={9} fill="currentColor" />
					{sessionStatus}
				</span>
			</div>
			<h1 id="home-title">
				{data.currentSession
					? registrationOpen
						? m.home_title()
						: m.home_closed_title()
					: m.home_unavailable_title()}
			</h1>
			<p class="hero__intro">
				{data.currentSession
					? registrationOpen
						? m.home_intro()
						: m.home_closed_intro()
					: m.home_unavailable_intro()}
			</p>
			<div class="hero__actions">
				{#if registrationOpen}
					<a class="button button--primary" href={localizedPath('/registration-application')}>
						{m.home_apply_now()} <span class="directional-icon"><ArrowRight size={17} /></span>
					</a>
				{:else}
					<span class="button button--disabled">{m.home_applications_closed()}</span>
				{/if}
				<a class="button button--secondary" href={localizedPath('/register')}>
					<UserPlus size={17} />
					{m.home_create_account()}
				</a>
			</div>
		</div>

		<aside class="period-card" aria-labelledby="period-title">
			<span class="period-card__icon"><CalendarDays size={26} /></span>
			<div>
				<p id="period-title">{m.home_registration_period()}</p>
				<strong>{registrationDates}</strong>
				<small>
					{!data.currentSession
						? m.home_registration_unavailable_notice()
						: registrationOpen
							? m.home_registration_notice()
							: m.home_registration_closed_notice()}
				</small>
			</div>
		</aside>
	</section>

	<section class="programs" aria-labelledby="programs-title">
		<div class="section-heading">
			<span class="section-heading__icon"><FileText size={21} /></span>
			<div>
				<h2 id="programs-title">{m.home_programs_title()}</h2>
				<p>{m.home_programs_intro()}</p>
			</div>
		</div>

		<div class="program-grid">
			<article class="program-card">
				<span><Check size={17} /></span>
				<div>
					<h3>{m.home_program_master_one()}</h3>
					<p>{m.home_program_master_one_detail()}</p>
				</div>
			</article>
			<article class="program-card">
				<span><Check size={17} /></span>
				<div>
					<h3>{m.home_program_master_two()}</h3>
					<p>{m.home_program_master_two_detail()}</p>
				</div>
			</article>
			<article class="program-card">
				<span><Check size={17} /></span>
				<div>
					<h3>{m.home_program_bachelor()}</h3>
					<p>{m.home_program_bachelor_detail()}</p>
				</div>
			</article>
		</div>
	</section>

	<section class="steps" aria-labelledby="steps-title">
		<div class="steps__heading">
			<p class="eyebrow">{m.home_steps_eyebrow()}</p>
			<h2 id="steps-title">{m.home_steps_title()}</h2>
		</div>
		<ol>
			<li>
				<span class="step-number">1</span>
				<UserPlus size={22} />
				<h3>{m.home_step_account_title()}</h3>
				<p>{m.home_step_account_description()}</p>
			</li>
			<li>
				<span class="step-number">2</span>
				<FileText size={22} />
				<h3>{m.home_step_application_title()}</h3>
				<p>{m.home_step_application_description()}</p>
			</li>
			<li>
				<span class="step-number">3</span>
				<ClipboardCheck size={22} />
				<h3>{m.home_step_tracking_title()}</h3>
				<p>{m.home_step_tracking_description()}</p>
			</li>
		</ol>
	</section>
</div>

<style>
	.home-page {
		display: grid;
		gap: 2rem;
	}

	.hero {
		display: grid;
		grid-template-columns: minmax(0, 1.45fr) minmax(17rem, 0.65fr);
		gap: clamp(2rem, 5vw, 5rem);
		align-items: center;
		border-radius: 1.25rem;
		background: linear-gradient(135deg, var(--ufas-green), #153f31);
		padding: clamp(2rem, 6vw, 4.5rem);
		color: white;
		box-shadow: 0 1.5rem 3rem rgb(14 72 52 / 16%);
	}

	.eyebrow {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin: 0;
		color: var(--ufas-gold);
		font-size: 0.75rem;
		font-weight: 800;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.hero__year {
		margin: 0;
		color: #d4ebdf;
		font-size: 0.875rem;
		font-weight: 700;
	}

	.hero__meta {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.75rem;
		margin: 1.5rem 0 0.5rem;
	}

	.session-status {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		border-radius: 999px;
		background: rgb(255 255 255 / 12%);
		padding: 0.3rem 0.625rem;
		color: #e8d9bd;
		font-size: 0.6875rem;
		font-weight: 800;
	}

	.session-status--open {
		background: rgb(212 235 223 / 16%);
		color: #bde7d1;
	}

	.hero h1 {
		max-width: 42rem;
		margin: 0;
		font-size: clamp(2rem, 5vw, 3.5rem);
		line-height: 1.08;
		letter-spacing: -0.035em;
	}

	.hero__intro {
		max-width: 42rem;
		margin: 1.25rem 0 0;
		color: #eaf3ee;
		font-size: 1.0625rem;
		line-height: 1.8;
	}

	.hero__actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		margin-top: 2rem;
	}

	.button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		border-radius: 0.625rem;
		padding: 0.75rem 1rem;
		font-size: 0.875rem;
		font-weight: 700;
		text-decoration: none;
		transition:
			transform 150ms ease,
			background-color 150ms ease;
	}

	.button:hover {
		transform: translateY(-1px);
	}

	.button:focus-visible {
		outline: 2px solid var(--ufas-gold);
		outline-offset: 3px;
	}

	.button--primary {
		background: var(--ufas-gold);
		color: #1f3029;
	}

	.button--primary:hover {
		background: #c9aa70;
	}

	.button--secondary {
		border: 1px solid rgb(255 255 255 / 35%);
		background: rgb(255 255 255 / 8%);
		color: white;
	}

	.button--secondary:hover {
		background: rgb(255 255 255 / 14%);
	}

	.button--disabled {
		background: rgb(255 255 255 / 10%);
		color: #cfe1db;
		cursor: not-allowed;
	}

	:global([dir='rtl']) .directional-icon {
		transform: rotate(180deg);
	}

	.directional-icon {
		display: inline-flex;
	}

	.period-card {
		display: grid;
		gap: 1rem;
		border: 1px solid rgb(185 151 91 / 55%);
		border-radius: 1rem;
		background: rgb(255 255 255 / 8%);
		padding: 1.5rem;
		backdrop-filter: blur(8px);
	}

	.period-card__icon {
		display: grid;
		width: 3rem;
		height: 3rem;
		place-items: center;
		border-radius: 0.75rem;
		background: var(--ufas-gold);
		color: var(--ufas-green);
	}

	.period-card p,
	.period-card strong,
	.period-card small {
		display: block;
	}

	.period-card p {
		margin: 0 0 0.5rem;
		color: #d4ebdf;
		font-size: 0.75rem;
		font-weight: 800;
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}

	.period-card strong {
		font-size: 1.125rem;
		line-height: 1.5;
	}

	.period-card small {
		margin-top: 0.75rem;
		color: #cfe1db;
		line-height: 1.6;
	}

	.programs,
	.steps {
		border: 1px solid #dce7e2;
		border-radius: 1rem;
		background: white;
		padding: clamp(1.5rem, 4vw, 2.5rem);
	}

	.section-heading {
		display: flex;
		align-items: flex-start;
		gap: 1rem;
	}

	.section-heading__icon {
		display: grid;
		width: 2.75rem;
		height: 2.75rem;
		flex: none;
		place-items: center;
		border-radius: 0.75rem;
		background: var(--ufas-green-soft);
		color: var(--ufas-green);
	}

	.section-heading h2,
	.steps h2 {
		margin: 0;
		color: var(--ufas-green);
		font-size: clamp(1.4rem, 3vw, 1.75rem);
	}

	.section-heading p {
		margin: 0.375rem 0 0;
		color: #64748b;
		line-height: 1.6;
	}

	.program-grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 1rem;
		margin-top: 1.75rem;
	}

	.program-card {
		display: flex;
		gap: 0.75rem;
		border: 1px solid #e2e8f0;
		border-radius: 0.75rem;
		background: var(--ufas-surface);
		padding: 1.125rem;
	}

	.program-card > span {
		display: grid;
		width: 1.75rem;
		height: 1.75rem;
		flex: none;
		place-items: center;
		border-radius: 999px;
		background: var(--ufas-green-muted);
		color: var(--ufas-green);
	}

	.program-card h3 {
		margin: 0;
		color: #25352f;
		font-size: 0.9375rem;
	}

	.program-card p {
		margin: 0.375rem 0 0;
		color: #64748b;
		font-size: 0.8125rem;
		line-height: 1.5;
	}

	.steps__heading {
		text-align: center;
	}

	.steps__heading .eyebrow {
		justify-content: center;
		color: var(--ufas-green-hover);
	}

	.steps h2 {
		margin-top: 0.5rem;
	}

	.steps ol {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 1rem;
		margin: 2rem 0 0;
		padding: 0;
		list-style: none;
	}

	.steps li {
		position: relative;
		border-top: 3px solid var(--ufas-gold);
		border-radius: 0.75rem;
		background: var(--ufas-green-soft);
		padding: 1.5rem;
		color: var(--ufas-green);
	}

	.step-number {
		position: absolute;
		top: 1rem;
		inset-inline-end: 1rem;
		color: rgb(14 72 52 / 25%);
		font-size: 1.5rem;
		font-weight: 800;
	}

	.steps h3 {
		margin: 1rem 0 0;
		font-size: 1rem;
	}

	.steps li p {
		margin: 0.5rem 0 0;
		color: #52655d;
		font-size: 0.875rem;
		line-height: 1.65;
	}

	@media (max-width: 48rem) {
		.hero {
			grid-template-columns: 1fr;
		}

		.program-grid,
		.steps ol {
			grid-template-columns: 1fr;
		}
	}

	@media (max-width: 30rem) {
		.hero {
			padding: 1.5rem;
		}

		.hero__actions,
		.button {
			width: 100%;
			box-sizing: border-box;
		}
	}
</style>
