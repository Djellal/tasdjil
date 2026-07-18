<script lang="ts">
	import { page } from '$app/state';
	import { baseLocale, extractLocaleFromUrl } from '$lib/paraglide/runtime';

	let locale = $derived(extractLocaleFromUrl(page.url) ?? baseLocale);
</script>

{#if locale === 'ar'}
	<article class="announcement" aria-labelledby="announcement-title">
		<h1 id="announcement-title">🎓 فتح منصة التسجيل</h1>

		<p>
			تعلن جامعة سطيف 1 - فرحات عباس عن فتح المنصة الإلكترونية لاستقبال طلبات الترشح للدراسة في:
		</p>

		<ul>
			<li><strong>الماستر 1</strong> (فئة 20%)</li>
			<li><strong>الماستر 2</strong> معبر</li>
			<li><strong>السنة الثالثة ليسانس</strong> (لحاملي شهادة الدراسات الجامعية التطبيقية)</li>
		</ul>

		<p class="announcement__date">
			<strong>📅 مدة التسجيل:</strong><br />
			من <strong>01 جويلية 2026</strong> إلى <strong>31 جويلية 2026</strong>
		</p>
	</article>
{:else}
	<h1>Welcome to SvelteKit</h1>
	<p>
		Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation
	</p>
{/if}

<style>
	.announcement {
		max-width: 48rem;
		margin-inline: auto;
		border: 1px solid #dbeafe;
		border-radius: 1rem;
		background: white;
		padding: clamp(1.5rem, 4vw, 2.5rem);
		box-shadow: 0 1rem 2.5rem rgb(15 23 42 / 6%);
	}

	.announcement h1 {
		margin: 0 0 1.5rem;
		color: #1d4ed8;
		font-size: clamp(1.5rem, 4vw, 2rem);
	}

	.announcement p {
		color: #334155;
		font-size: 1.0625rem;
		line-height: 1.9;
	}

	.announcement ul {
		margin-block: 1.5rem;
		padding-inline-start: 1.5rem;
		color: #1e293b;
		line-height: 2;
	}

	.announcement li::marker {
		content: '✓  ';
		color: #16a34a;
		font-weight: 700;
	}

	.announcement__date {
		margin: 0;
		border-radius: 0.75rem;
		background: #eff6ff;
		padding: 1rem 1.25rem;
	}
</style>
