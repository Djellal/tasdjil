<script lang="ts">
	import type { Snippet } from 'svelte';
	import { X } from '@lucide/svelte';

	let {
		open = $bindable(false),
		title = '',
		children
	}: {
		open: boolean;
		title?: string;
		children: Snippet;
	} = $props();

	let dialogEl: HTMLDialogElement | undefined = $state();

	$effect(() => {
		if (!dialogEl) return;
		if (open && !dialogEl.open) {
			dialogEl.showModal();
		} else if (!open && dialogEl.open) {
			dialogEl.close();
		}
	});

	function handleDialogClose() {
		open = false;
	}

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === dialogEl) {
			open = false;
		}
	}
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<dialog
	class="modal"
	bind:this={dialogEl}
	onclose={handleDialogClose}
	onclick={handleBackdropClick}
>
	<div class="modal__panel">
		<header class="modal__header">
			<h2>{title}</h2>
			<button class="modal__close" type="button" onclick={() => (open = false)}>
				<X size={18} />
			</button>
		</header>
		<div class="modal__body">
			{@render children()}
		</div>
	</div>
</dialog>

<style>
	.modal {
		border: 0;
		border-radius: 1rem;
		padding: 0;
		max-width: 48rem;
		width: calc(100% - 2rem);
		max-height: calc(100vh - 4rem);
		background: transparent;
		overflow: visible;
		box-shadow: 0 1.5rem 4rem rgb(15 23 42 / 20%);
	}

	.modal::backdrop {
		background: rgb(15 23 42 / 40%);
		backdrop-filter: blur(4px);
	}

	.modal__panel {
		display: flex;
		flex-direction: column;
		max-height: calc(100vh - 4rem);
		border: 1px solid #e2e8f0;
		border-radius: 1rem;
		background: white;
	}

	.modal__header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		border-bottom: 1px solid #e2e8f0;
		padding: 1.25rem 1.5rem;
	}

	.modal__header h2 {
		margin: 0;
		color: var(--ufas-green);
		font-size: 1.25rem;
	}

	.modal__close {
		display: grid;
		place-items: center;
		width: 2rem;
		height: 2rem;
		border: 0;
		border-radius: 0.5rem;
		background: transparent;
		color: #64748b;
		cursor: pointer;
		transition: background-color 150ms ease;
	}

	.modal__close:hover {
		background: #f1f5f9;
		color: #334155;
	}

	.modal__body {
		overflow-y: auto;
		padding: 1.5rem;
	}
</style>
