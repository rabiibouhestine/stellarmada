<script>
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { socket } from '$lib/modules/socket.js';
	import Lobby from './Lobby.svelte';
	import Game from './Game.svelte';

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
			socket.off('joinRoomResponse');
			socket.off('handleReadyResponse');
			socket.off('rematchResponse');
		};
	});
</script>

{#if gameStarted}
	<Game />
{:else}
	<Lobby />
{/if}
