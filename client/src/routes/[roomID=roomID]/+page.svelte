<script>
	import { onMount } from 'svelte';
	import { socket } from '$lib/modules/stores.js';
	import Lobby from './Lobby.svelte';
	import Game from './Game.svelte';

	export let data;

	let gameStarted = data.gameStarted;

	onMount(() => {
		$socket.on('handleReadyResponse', () => {
			gameStarted = true;
		});

		$socket.on('rematchResponse', () => {
			gameStarted = false;
		});

		return () => {
			$socket.off('handleReadyResponse');
			$socket.off('rematchResponse');
		};
	});
</script>

{#if gameStarted}
	<Game />
{:else}
	<Lobby playersNb={data.playersNb} />
{/if}
