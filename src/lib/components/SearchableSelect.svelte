<script lang="ts">
	import { tick } from 'svelte';
	import { Check, ChevronDown, Search } from '@lucide/svelte';

	type Option = {
		value: string | number;
		label: string;
	};

	let {
		name,
		options,
		placeholder,
		label = placeholder,
		searchPlaceholder,
		noResults,
		disabled = false,
		required = false,
		value = $bindable<string | number | ''>(''),
		onchange
	}: {
		name: string;
		options: Option[];
		placeholder: string;
		label?: string;
		searchPlaceholder: string;
		noResults: string;
		disabled?: boolean;
		required?: boolean;
		value?: string | number | '';
		onchange?: () => void;
	} = $props();

	let root: HTMLDivElement;
	let searchInput = $state<HTMLInputElement>();
	let open = $state(false);
	let query = $state('');
	let activeIndex = $state(0);

	let selectedOption = $derived(options.find((option) => String(option.value) === String(value)));
	let filteredOptions = $derived(
		options.filter((option) =>
			option.label.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())
		)
	);

	async function showOptions() {
		if (disabled) return;
		open = true;
		query = '';
		activeIndex = Math.max(
			0,
			options.findIndex((option) => String(option.value) === String(value))
		);
		await tick();
		searchInput?.focus();
	}

	function closeOptions() {
		open = false;
		query = '';
	}

	function choose(option: Option) {
		value = option.value;
		closeOptions();
		onchange?.();
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			closeOptions();
			return;
		}
		if (event.key === 'ArrowDown') {
			event.preventDefault();
			activeIndex = Math.min(activeIndex + 1, filteredOptions.length - 1);
		}
		if (event.key === 'ArrowUp') {
			event.preventDefault();
			activeIndex = Math.max(activeIndex - 1, 0);
		}
		if (event.key === 'Enter' && filteredOptions[activeIndex]) {
			event.preventDefault();
			choose(filteredOptions[activeIndex]);
		}
	}
</script>

<svelte:window
	onclick={(event) => open && !root?.contains(event.target as Node) && closeOptions()}
/>

<div class="searchable-select" class:searchable-select--open={open} bind:this={root}>
	<select
		class="native-select"
		{name}
		{required}
		{disabled}
		bind:value
		tabindex="-1"
		aria-hidden="true"
		oninvalid={showOptions}
	>
		<option value="" disabled>{placeholder}</option>
		{#each options as option (option.value)}
			<option value={option.value}>{option.label}</option>
		{/each}
	</select>

	<button
		class="select-trigger"
		class:select-trigger--placeholder={!selectedOption}
		type="button"
		{disabled}
		aria-haspopup="listbox"
		aria-expanded={open}
		aria-label={label}
		onclick={() => (open ? closeOptions() : showOptions())}
	>
		<span class="selected-label">{selectedOption?.label ?? placeholder}</span>
		<span class="chevron"><ChevronDown size={17} aria-hidden="true" /></span>
	</button>

	{#if open}
		<div class="select-menu">
			<div class="search-box">
				<Search size={16} aria-hidden="true" />
				<input
					bind:this={searchInput}
					bind:value={query}
					placeholder={searchPlaceholder}
					aria-label={searchPlaceholder}
					oninput={() => (activeIndex = 0)}
					onkeydown={handleKeydown}
				/>
			</div>
			<div class="option-list" role="listbox" aria-label={label}>
				{#each filteredOptions as option, index (option.value)}
					<button
						class:option--active={index === activeIndex}
						class:option--selected={String(option.value) === String(value)}
						type="button"
						role="option"
						aria-selected={String(option.value) === String(value)}
						onmouseenter={() => (activeIndex = index)}
						onclick={() => choose(option)}
					>
						<span>{option.label}</span>
						{#if String(option.value) === String(value)}<Check size={16} aria-hidden="true" />{/if}
					</button>
				{:else}
					<p class="no-results">{noResults}</p>
				{/each}
			</div>
		</div>
	{/if}
</div>

<style>
	.searchable-select {
		position: relative;
		min-width: 0;
	}
	.native-select {
		position: absolute;
		width: 1px !important;
		height: 1px;
		min-height: 0 !important;
		overflow: hidden;
		opacity: 0;
		pointer-events: none;
	}
	.select-trigger {
		display: flex;
		width: 100%;
		min-height: 2.8rem;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		box-sizing: border-box;
		border: 1px solid #cbd5e1;
		border-radius: 0.625rem;
		background: white;
		padding: 0.7rem 0.8rem;
		color: #0f172a;
		cursor: pointer;
		font: inherit;
		font-weight: 500;
		text-align: start;
		box-shadow: 0 1px 2px rgb(15 23 42 / 3%);
		transition:
			border-color 150ms ease,
			box-shadow 150ms ease;
	}
	.selected-label {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.chevron {
		display: inline-flex;
		flex: 0 0 auto;
		color: #64748b;
		transition: transform 150ms ease;
	}
	.select-trigger--placeholder {
		color: #64748b;
	}
	.select-trigger:hover:not(:disabled) {
		border-color: #94a3b8;
	}
	.select-trigger:focus-visible,
	.searchable-select--open .select-trigger {
		border-color: #2563eb;
		outline: none;
		box-shadow: 0 0 0 3px rgb(37 99 235 / 14%);
	}
	.searchable-select--open .chevron {
		transform: rotate(180deg);
	}
	.select-trigger:disabled {
		background: #f8fafc;
		color: #64748b;
		cursor: not-allowed;
	}
	.select-menu {
		position: absolute;
		z-index: 30;
		top: calc(100% + 0.4rem);
		left: 0;
		width: 100%;
		min-width: 15rem;
		overflow: hidden;
		border: 1px solid #dbe3ee;
		border-radius: 0.75rem;
		background: white;
		padding: 0.4rem;
		box-shadow: 0 1rem 2.5rem rgb(15 23 42 / 16%);
	}
	.search-box {
		display: flex;
		align-items: center;
		gap: 0.55rem;
		border-bottom: 1px solid #e2e8f0;
		padding: 0.25rem 0.45rem 0.55rem;
		color: #64748b;
	}
	.search-box input {
		width: 100%;
		min-height: 2rem;
		border: 0;
		background: transparent;
		padding: 0.25rem;
		color: #0f172a;
		font: inherit;
		font-weight: 500;
		outline: none;
		box-shadow: none;
	}
	.option-list {
		max-height: 14rem;
		overflow-y: auto;
		padding-top: 0.35rem;
	}
	.option-list button {
		display: flex;
		width: 100%;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		border: 0;
		border-radius: 0.45rem;
		background: transparent;
		padding: 0.65rem 0.7rem;
		color: #334155;
		cursor: pointer;
		font: inherit;
		font-weight: 500;
		text-align: start;
	}
	.option-list button span {
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.option-list button:hover,
	.option-list .option--active {
		background: #eff6ff;
		color: #1d4ed8;
	}
	.option-list .option--selected {
		color: #1d4ed8;
		font-weight: 700;
	}
	.no-results {
		margin: 0;
		padding: 1.25rem 0.75rem;
		color: #64748b;
		font-size: 0.8rem;
		font-weight: 500;
		text-align: center;
	}
</style>
