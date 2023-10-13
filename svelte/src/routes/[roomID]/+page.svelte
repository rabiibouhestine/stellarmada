<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { socket } from '$lib/index.js';
	import Lobby from './Lobby.svelte';
	import Game from './Game.svelte';

	let gameStarted = false;

	onMount(() => {
		socket.emit('joinRoom', { roomID: $page.params.roomID });

		socket.on('joinRoomResponse', (data) => {
			// if response has error we redirect user to home page
			if ('error' in data) {
				goto('/');
				return;
			}
			// if response is success we proceed
			gameStarted = true;
		});

		socket.on('handleReadyResponse', () => {
			gameStarted = true;
		});

		socket.on('goBackLobbyResponse', () => {
			gameStarted = false;
		});
	});
</script>

{#if gameStarted}
	<Game />
{:else}
	<Lobby />
{/if}
