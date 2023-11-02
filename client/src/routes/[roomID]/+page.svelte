<script>
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import Lobby from './Lobby.svelte';
	import Game from './Game.svelte';

	export let data;

	const socket = data.socket;
	let gameStarted = false;

	onMount(() => {
		socket.emit('joinRoom', { roomID: $page.params.roomID });

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
	<Game {socket} />
{:else}
	<Lobby {socket} />
{/if}
