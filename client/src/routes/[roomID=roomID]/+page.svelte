<script>
	import { onMount } from 'svelte';
	import { socket as socketStore } from '$lib/modules/stores.js';
	import Lobby from './Lobby.svelte';
	import Game from './Game.svelte';

	export let data;

	let gameStarted = data.gameStarted;

	const socket = $socketStore;

	onMount(() => {
		socket.on('handleReadyResponse', () => {
			gameStarted = true;
		});

		socket.on('rematchResponse', () => {
			gameStarted = false;
		});

		return () => {
			socket.off('handleReadyResponse');
			socket.off('rematchResponse');
			socket.off('gameStatus');
		};
	});
</script>

{#if gameStarted}
	<Game />
{:else}
	<Lobby playersNb={data.playersNb} />
{/if}
