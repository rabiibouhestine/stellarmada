<script>
	import { onMount } from 'svelte';
	import { socketStore } from '$lib/modules/stores.js';
	import Lobby from './Lobby.svelte';
	import Game from './Game.svelte';
	import io from 'socket.io-client';

	export let data;

	let gameStarted = data.gameStarted;

	socketStore.set(
		io.connect('http://localhost:3001', {
			query: {
				userID: data.userID
			}
		})
	);

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
			socket.disconnect();
		};
	});
</script>

{#if gameStarted}
	<Game />
{:else}
	<Lobby playersNb={data.playersNb} />
{/if}
