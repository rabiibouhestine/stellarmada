<script>
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { socket } from '$lib/index.js';
	import { Game } from '../../game/Game.js';
	import Modal from '$lib/components/Modal.svelte';

	let game;
	let winnerID;
	let isGameOver = false;

	onMount(() => {
		socket.emit('gameStateRequest', { roomID: $page.params.roomID });

		socket.on('gameStateResponse', (data) => {
			game = new Game({
				canvasRef: document.getElementById('pixi-container'),
				socket: socket,
				gameState: data.gameState
			});
			game.onConfirmButton(() => handleConfirmButton());
		});

		socket.on('gameActionResponse', (data) => {
			game.update(data.gameAction);
			isGameOver = data.gameAction.isGameOver;
			winnerID = data.gameAction.winnerID;
		});

		return () => {
			socket.off('gameStateResponse');
			socket.off('gameActionResponse');
			game.end();
		};
	});

	function handleConfirmButton() {
		const selectedCards = {
			hand: game.players[socket.id].hand.filter((card) => card.selected).map((card) => card.name),
			rearguard: game.players[socket.id].rearguard
				.filter((card) => card.selected)
				.map((card) => card.name)
		};

		socket.emit('gameActionRequest', {
			roomID: $page.params.roomID,
			playerSelection: selectedCards
		});
	}

	function handleRematch() {
		socket.emit('goBackLobbyRequest', { roomID: $page.params.roomID });
	}

	function handleLeave() {
		goto('/');
	}
</script>

<div id="pixi-container">
	<Modal />
</div>
