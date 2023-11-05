<script>
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import Lobby from './Lobby.svelte';
	import Game from './Game.svelte';
	import io from 'socket.io-client';

	export let data;
	const playerID = data.userID;
	const playersNb = data.playersNb;
	let gameStarted = data.gameStarted;

	const socket = io.connect('http://localhost:3001', {
		query: {
			playerID: playerID
		}
	});

	onMount(() => {
		socket.emit('joinRoom', {
			roomID: $page.params.roomID
		});

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
	<Game {socket} {playerID} />
{:else}
	<Lobby {socket} {playersNb} />
{/if}
