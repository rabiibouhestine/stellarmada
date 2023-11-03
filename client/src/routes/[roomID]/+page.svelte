<script>
	import { onMount } from 'svelte';
	import Lobby from './Lobby.svelte';
	import Game from './Game.svelte';

	export let data;

	let socket;
	let gameStarted = data.gameStarted;

	onMount(() => {
		socket = data.socket;

		socket.on('handleReadyResponse', () => {
			gameStarted = true;
		});

		socket.on('rematchResponse', () => {
			gameStarted = false;
		});

		return () => {
			socket.off('handleReadyResponse');
			socket.off('rematchResponse');
		};
	});
</script>

{#if gameStarted}
	<Game {data} />
{:else}
	<Lobby {data} />
{/if}
