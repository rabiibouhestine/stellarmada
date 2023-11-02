<script>
	import { onMount } from 'svelte';
	import { Icon, Home, Flag, QuestionMarkCircle, Cog6Tooth } from 'svelte-hero-icons';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import Modal from '$lib/components/Modal.svelte';
	import Timer from '$lib/modules/Timer.js';
	import Chat from './Chat.svelte';
	import Logs from './Logs.svelte';
	import { Game } from '../../game/Game.js';

	export let data;

	const socket = data.socket;
	const playerID = socket.id;

	const playerTimer = new Timer(onTimerEnd, 1000 * 60 * 10);
	const opponentTimer = new Timer(onTimerEnd, 1000 * 60 * 10);

	let canvas;
	let winnerID;
	let isGameOver = false;
	let showRulesModal = false;
	let showSurrenderModal = false;
	let showQuitModal = false;
	let playerTimeLeft = 0;
	let opponentTimeLeft = 0;

	let game;
	let logs = [];

	onMount(() => {
		setInterval(() => {
			playerTimeLeft = playerTimer.timeLeft;
			opponentTimeLeft = opponentTimer.timeLeft;
		}, 1000);

		socket.emit('gameStateRequest', { roomID: $page.params.roomID });

		socket.on('gameStateResponse', (data) => {
			game = new Game(canvas, data.gameState, socket.id);
			game.onConfirmButton(() => handleConfirmButton());
			logs = data.gameState.logs;
		});

		socket.on('gameActionResponse', (data) => {
			game.update(data.gameAction);
			isGameOver = data.gameAction.isGameOver;
			winnerID = data.gameAction.winnerID;
			logs = [...logs, ...data.gameAction.logs];

			if (data.gameAction.turn.stance === 'discarding') {
				if (data.gameAction.turn.playerID === playerID) {
					playerTimer.start();
					opponentTimer.stop();
				} else {
					opponentTimer.start();
					playerTimer.stop();
				}
			}
		});

		socket.on('surrenderResponse', (data) => {
			isGameOver = true;
			winnerID = data.winnerID;
			playerTimer.stop();
			opponentTimer.stop();
		});

		return () => {
			socket.off('gameStateResponse');
			socket.off('gameActionResponse');
			socket.off('surrenderResponse');
			game.end();
		};
	});

	function formatTime(milliseconds) {
		const totalSeconds = Math.floor(milliseconds / 1000);
		const minutes = Math.floor(totalSeconds / 60);
		const seconds = totalSeconds % 60;

		const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
		const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;

		return `${formattedMinutes}:${formattedSeconds}`;
	}

	function handleConfirmButton() {
		const selectedCards = game.players[playerID].hand.cards
			.filter((card) => card.selected)
			.map((card) => card.name);

		socket.emit('gameActionRequest', {
			roomID: $page.params.roomID,
			playerSelection: selectedCards
		});
	}

	function handleSurrender() {
		showSurrenderModal = false;
		socket.emit('surrenderRequest', { roomID: $page.params.roomID });
	}

	function handleRematch() {
		socket.emit('rematchRequest', { roomID: $page.params.roomID });
	}

	function handleLeave() {
		goto('/');
	}

	function onTimerEnd() {
		console.log('Timer ended');
	}
</script>

<div
	class="flex flex-row justify-center w-full h-screen bg-gradient-to-t from-apollo-blue-500 to-apollo-yellow-500"
>
	<div class="flex flex-col min-w-[300px] max-w-[300px] p-5 space-y-5">
		<div
			class="flex items-center justify-center bg-black bg-opacity-25 w-full min-h-[50px] rounded-lg"
		>
			<h1 class="text-slate-100 text-3xl font-bold">{formatTime(opponentTimeLeft)}</h1>
		</div>
		<div class="bg-black bg-opacity-25 w-full h-full rounded-xl overflow-y-auto">
			<Logs {logs} {data} />
		</div>
	</div>
	<div bind:this={canvas} id="pixi-container" class="min-w-0 aspect-square" />
	<div class="flex flex-col min-w-[300px] max-w-[300px] p-5 space-y-5">
		<div
			class="flex flex-row items-center justify-center bg-black bg-opacity-25 rounded-lg space-x-4 min-h-[60px] w-full"
		>
			<button
				on:click={() => {
					showRulesModal = true;
				}}
				class="flex items-center justify-center bg-black bg-opacity-25 h-10 w-12 rounded-lg hover:bg-apollo-yellow-300"
			>
				<Icon src={QuestionMarkCircle} class="h-8 w-8 text-white" />
			</button>
			<button
				on:click={() => {
					showSurrenderModal = true;
				}}
				class="flex items-center justify-center bg-black bg-opacity-25 h-10 w-12 rounded-lg hover:bg-apollo-red-300"
			>
				<Icon src={Flag} class="h-8 w-8 text-white" />
			</button>
			<button
				on:click={() => {
					showQuitModal = true;
				}}
				class="flex items-center justify-center bg-black bg-opacity-25 h-10 w-12 rounded-lg hover:bg-apollo-blue-300"
			>
				<Icon src={Home} class="h-8 w-8 text-white" />
			</button>
			<button
				class="flex items-center justify-center bg-black bg-opacity-25 h-10 w-12 rounded-lg hover:bg-apollo-green-300"
			>
				<Icon src={Cog6Tooth} class="h-8 w-8 text-white" />
			</button>
		</div>
		{#if false}
			<div class="bg-black bg-opacity-25 w-full min-h-[260px] rounded-lg" />
		{/if}
		<div class="bg-black bg-opacity-25 w-full h-full rounded-xl overflow-y-auto">
			<Chat {data} />
		</div>
		<div
			class="flex items-center justify-center bg-black bg-opacity-25 w-full min-h-[50px] rounded-lg"
		>
			<h1 class="text-slate-100 text-3xl font-bold">{formatTime(playerTimeLeft)}</h1>
		</div>
	</div>
	<Modal bind:showModal={showRulesModal}>
		<div class="grid justify-items-center w-full text-slate-200">RULES HERE</div>
	</Modal>
	<Modal bind:showModal={showSurrenderModal}>
		<div class="grid justify-items-center w-full">
			<div class="text-4xl text-center text-slate-200 font-black drop-shadow-md">
				ARE YOU SURE YOU WANT TO SURRENDER?
			</div>
			<div class="p-6 flex justify-center">
				<button
					class="mx-2 px-4 py-2 rounded-lg bg-apollo-red-300 hover:bg-apollo-red-400 font-black text-lg text-white"
					on:click={() => {
						showSurrenderModal = false;
					}}
				>
					CANCEL
				</button>
				<button
					class="mx-2 px-4 py-2 rounded-lg font-black text-lg text-white bg-apollo-green-400 hover:bg-apollo-green-500"
					on:click={handleSurrender}
				>
					CONFIRM
				</button>
			</div>
		</div>
	</Modal>
	<Modal bind:showModal={showQuitModal}>
		<div class="grid justify-items-center w-full">
			<div class="text-4xl text-center text-slate-200 font-black drop-shadow-md">
				ARE YOU SURE YOU WANT TO QUIT?
			</div>
			<div class="p-6 flex justify-center">
				<button
					class="mx-2 px-4 py-2 rounded-lg bg-apollo-red-300 hover:bg-apollo-red-400 font-black text-lg text-white"
					on:click={() => {
						showQuitModal = false;
					}}
				>
					CANCEL
				</button>
				<button
					class="mx-2 px-4 py-2 rounded-lg font-black text-lg text-white bg-apollo-green-400 hover:bg-apollo-green-500"
					on:click={handleLeave}
				>
					CONFIRM
				</button>
			</div>
		</div>
	</Modal>
	<Modal bind:showModal={isGameOver}>
		<div class="grid justify-items-center w-full">
			<div class="text-4xl text-center text-slate-200 font-black drop-shadow-md">
				{#if winnerID === playerID}
					<h2>You Won !!!</h2>
				{:else}
					<h2>You lost...</h2>
				{/if}
			</div>
			<div class="p-6 flex justify-center">
				<button
					class="mx-2 px-4 py-2 rounded-lg bg-apollo-red-300 hover:bg-apollo-red-400 font-black text-lg text-white"
					on:click={handleLeave}
				>
					LEAVE
				</button>
				<button
					class="mx-2 px-4 py-2 rounded-lg font-black text-lg text-white bg-apollo-green-400 hover:bg-apollo-green-500"
					on:click={handleRematch}
				>
					REMATCH
				</button>
			</div>
		</div>
	</Modal>
</div>
