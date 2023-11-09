<script>
	import { createEventDispatcher } from 'svelte';

	export let showModal;
	export let title;
	export let closeButtonLabel;
	export let confirmButtonLabel;

	let dialog;

	$: if (dialog && showModal) dialog.showModal();
	$: if (dialog && !showModal) dialog.close();

	const dispatch = createEventDispatcher();

	function dispatchConfirm() {
		dispatch('confirm', {
			text: 'Hello!'
		});
	}

	function dispatchClose() {
		dispatch('close', {
			text: 'Hello!'
		});
	}
</script>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
<dialog bind:this={dialog} on:close={() => (showModal = false)}>
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div class="grid justify-items-center w-full" on:click|stopPropagation>
		<div class="text-2xl text-center text-slate-200 font-black drop-shadow-md">
			{title}
		</div>
		<slot />
		<div class="p-6 flex justify-center">
			<button
				class="mx-2 px-4 py-2 rounded-lg bg-apollo-yellow-300 hover:bg-apollo-yellow-400 font-black text-lg text-white"
				on:click={() => {
					showModal = false;
					dispatchClose();
				}}
			>
				{closeButtonLabel}
			</button>
			<button
				class="mx-2 px-4 py-2 rounded-lg font-black text-lg text-white bg-apollo-blue-400 hover:bg-apollo-blue-500"
				on:click={dispatchConfirm}
			>
				{confirmButtonLabel}
			</button>
		</div>
	</div>
</dialog>

<style lang="postcss">
	dialog {
		max-width: 32em;
		border: none;
		padding: 0;
		@apply bg-black bg-opacity-50 rounded-xl backdrop-blur-sm;
	}
	dialog > div {
		padding: 1em;
	}
	dialog[open] {
		animation: zoom 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
	}
	@keyframes zoom {
		from {
			transform: scale(0.95);
		}
		to {
			transform: scale(1);
		}
	}
	dialog[open]::backdrop {
		animation: fade 0.2s ease-out;
	}
	@keyframes fade {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
</style>
