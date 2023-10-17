<script>
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { socket } from '$lib/modules/socket.js';
	import { Game } from '../../game/Game.js';
	import Modal from '$lib/components/Modal.svelte';

	let game;
	let winnerID;
	let isGameOver = false;
	const playerID = localStorage.getItem('playerID');

	onMount(() => {
		socket.emit('gameStateRequest', { roomID: $page.params.roomID });

		socket.on('gameStateResponse', (data) => {
			game = new Game({
				canvasRef: document.getElementById('pixi-container'),
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
			hand: game.players[playerID].hand.filter((card) => card.selected).map((card) => card.name),
			rearguard: game.players[playerID].rearguard
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

<div class="flex flex-row w-full h-screen">
	<div class="flex justify-items-end h-screen flex-col w-1/5 pl-5 py-5">
		<div class="bg-slate-400 w-full h-10 rounded-lg mb-5" />
		<div class="bg-slate-400 w-full h-full rounded-xl" />
	</div>
	<div id="pixi-container" class="w-3/5" />
	<div class="flex justify-items-start h-screen flex-col w-1/5 pr-5 py-5">
		<div class="bg-slate-400 w-full h-full rounded-xl" />
		<div class="flex flex-row w-full mt-5">
			<div class="bg-slate-400 w-4/5 h-10 rounded-lg mr-5" />
			<div class="bg-slate-400 w-1/5 h-10 rounded-lg" />
		</div>
	</div>
	<Modal bind:showModal={isGameOver}>
		<div class="grid justify-items-center w-2/3">
			<div class="text-4xl text-center text-slate-500 font-black drop-shadow-md">
				{#if winnerID === playerID}
					<h2>You Won !!!</h2>
				{:else}
					<h2>You lost...</h2>
				{/if}
			</div>
			<div class="p-6 flex justify-center">
				<button
					class="mx-2 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-700 font-black text-lg text-white"
					on:click={handleLeave}
				>
					LEAVE
				</button>
				<button
					class="mx-2 px-4 py-2 rounded-lg font-black text-lg text-white bg-emerald-500 hover:bg-emerald-700"
					on:click={handleRematch}
				>
					REMATCH
				</button>
			</div>
		</div>
	</Modal>
</div>
