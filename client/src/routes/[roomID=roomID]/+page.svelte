<script>
	import { onMount } from 'svelte';
	import Lobby from './Lobby.svelte';
	import Game from './Game.svelte';
	import io from 'socket.io-client';

	export let data;

	let gameStarted = data.gameStarted;

	const socket = io.connect('http://localhost:3001', {
		query: {
			userID: data.userID
		}
	});

	let playerID;

	onMount(() => {
		socket.on('connect', () => {
			playerID = socket.id;
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
			socket.off('connect');
			socket.disconnect();
		};
	});
</script>

{#if gameStarted}
	<Game {socket} {playerID} />
{:else}
	<Lobby {socket} playersNb={data.playersNb} />
{/if}
