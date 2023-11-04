<script>
	import { page } from '$app/stores';
	import { Icon, User, Clipboard } from 'svelte-hero-icons';
	import { socketStore } from '$lib/modules/stores.js';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	export let playersNb;

	const socket = $socketStore;

	let isReady = false;
	let readyBtnClass = '';

	$: if (isReady) {
		readyBtnClass =
			'w-2/5 mx-2 px-4 py-2 rounded-lg font-black text-lg text-white bg-apollo-brown-300 hover:bg-apollo-brown-400';
	} else {
		readyBtnClass =
			'w-2/5 mx-2 px-4 py-2 rounded-lg font-black text-lg text-white bg-apollo-green-400 hover:bg-apollo-green-500';
	}

	function handleCopy() {
		navigator.clipboard.writeText($page.url);
	}

	function handleLeave() {
		socket.emit('leftRoom');
		goto('/');
	}

	function handleReady() {
		isReady = !isReady;
		socket.emit('handleReady', { roomID: $page.params.roomID, isReady: isReady });
	}

	onMount(() => {
		socket.emit('joinRoom', { roomID: $page.params.roomID });

		socket.on('roomUpdate', (data) => {
			playersNb = data.playersNb;
		});

		return () => {
			socket.off('roomUpdate');
		};
	});
</script>

<div
	class="flex items-center justify-center h-screen bg-gradient-to-t from-apollo-blue-500 to-apollo-yellow-500"
>
	<div class="grid justify-items-center w-2/3">
		<div class="flex items-center justify-between w-1/3">
			<div class="flex justify-center items-center rounded-full w-16 h-16 bg-apollo-blue-300">
				<Icon src={User} class="h-12 w-12 text-white" />
			</div>
			<h1 class="text-xl text-center text-slate-100 font-black">VS</h1>
			{#if playersNb === 2}
				<div class="flex justify-center items-center rounded-full w-16 h-16 bg-apollo-yellow-300">
					<Icon src={User} class="h-12 w-12 text-white" />
				</div>
			{:else}
				<div class="flex justify-center items-center rounded-full w-16 h-16 bg-slate-400" />
			{/if}
		</div>
		<div class="p-6">
			<h1 class="text-2xl text-center text-slate-100 font-black drop-shadow-md">
				{#if playersNb === 2}
					WAITING FOR EVERYONE TO BE READY
				{:else}
					WAITING FOR OPPONENT TO JOIN
				{/if}
			</h1>
		</div>
		<div class="my-6 flex justify-center items-center w-full">
			<button
				class="p-4 inline-flex space-x-2 items-center justify-center rounded-xl bg-black bg-opacity-40 hover:bg-opacity-80 font-black text-md text-white"
				on:click={handleCopy}
			>
				<Icon src={Clipboard} class="h-6 w-6" />
				<div class="flex flex-row space-x-4">
					<span>COPY INVITE LINK :</span>
					<h1 class="rounded-l-lg text-md text-center text-slate-100 font-medium">
						{$page.url}
					</h1>
				</div>
			</button>
		</div>
		<div class="p-6 flex justify-center w-2/3">
			<button
				class="w-1/5 mx-2 px-4 py-2 rounded-lg bg-apollo-red-300 hover:bg-apollo-red-400 font-black text-lg text-white"
				on:click={handleLeave}
			>
				LEAVE
			</button>
			<button class={readyBtnClass} on:click={handleReady}>
				{#if isReady}
					UNREADY
				{:else}
					READY
				{/if}
			</button>
		</div>
	</div>
</div>
