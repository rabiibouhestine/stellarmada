<script>
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import Lobby from './Lobby.svelte';
	import Game from './Game.svelte';
	import io from 'socket.io-client';

	export let data;
	const playerID = data.userID;
	const playersNb = data.playersNb;
	const isBotRoom = data.isBotRoom;
	const isCreated = data.isCreated;
	let gameStarted = data.gameStarted;

	const socket = io.connect('http://localhost:3001', {
		query: {
			playerID: playerID
		}
	});

	socket.emit('joinRoom', {
		roomID: $page.params.roomID
	});

	onMount(() => {
		socket.on('handleReadyResponse', () => {
			gameStarted = true;
		});

		socket.on('rematchResponse', () => {
			gameStarted = false;
		});

		socket.on('roomKick', () => {
			goto('/');
		});

		return () => {
			socket.off('handleReadyResponse');
			socket.off('rematchResponse');
			socket.disconnect();
		};
	});
</script>

{#if gameStarted}
	<Game {socket} {playerID} />
{:else}
	<Lobby {socket} {playersNb} {isBotRoom} {isCreated} />
{/if}
