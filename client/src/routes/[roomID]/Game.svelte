<script>
	import { onMount } from 'svelte';
	import { Icon, Home, Flag, QuestionMarkCircle } from 'svelte-hero-icons';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { socket } from '$lib/modules/socket.js';
	import { Game } from '../../game/Game.js';
	import Modal from '$lib/components/Modal.svelte';
	import Timer from '$lib/modules/Timer.js';

	let game;
	let winnerID;
	let isGameOver = false;
	let showRulesModal = false;
	let showSurrenderModal = false;
	let showQuitModal = false;
	let playerTimeLeft = 0;
	let opponentTimeLeft = 0;
	const playerTimer = new Timer(onTimerEnd, 1000 * 60 * 10);
	const opponentTimer = new Timer(onTimerEnd, 1000 * 60 * 10);
	const playerID = localStorage.getItem('playerID');

	onMount(() => {
		setInterval(() => {
			playerTimeLeft = playerTimer.timeLeft;
			opponentTimeLeft = opponentTimer.timeLeft;
		}, 1000);

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

	function handleSurrender() {
		showSurrenderModal = false;
		socket.emit('surrenderRequest', { roomID: $page.params.roomID });
	}

	function handleRematch() {
		socket.emit('goBackLobbyRequest', { roomID: $page.params.roomID });
	}

	function handleLeave() {
		goto('/');
	}

	function onTimerEnd() {
		console.log('Timer ended');
	}
</script>

<div class="flex flex-row justify-center w-full h-screen">
	<div class="flex flex-col min-w-[300px] p-5 space-y-5">
		<div class="flex items-center justify-center bg-slate-400 w-full min-h-[50px] rounded-lg">
			<h1 class="text-slate-100 text-3xl font-bold">{formatTime(opponentTimeLeft)}</h1>
		</div>
		<div class="bg-slate-400 w-full h-full rounded-xl" />
	</div>
	<div id="pixi-container" class="min-w-0 aspect-square" />
	<div class="flex flex-col min-w-[300px] p-5 space-y-5">
		{#if true}
			<div class="bg-slate-400 w-full min-h-[260px] rounded-lg" />
		{/if}
		<div class="bg-slate-400 w-full h-full rounded-xl" />
		<div
			class="flex flex-row items-center justify-center bg-slate-400 rounded-lg space-x-6 min-h-[60px] w-full"
		>
			<button
				on:click={() => {
					showRulesModal = true;
				}}
				class="flex items-center justify-center bg-slate-500 h-10 w-14 rounded-lg hover:bg-blue-500"
			>
				<Icon src={QuestionMarkCircle} class="h-8 w-8 text-white" />
			</button>
			<button
				on:click={() => {
					showSurrenderModal = true;
				}}
				class="flex items-center justify-center bg-slate-500 h-10 w-14 rounded-lg hover:bg-red-500"
			>
				<Icon src={Flag} class="h-8 w-8 text-white" />
			</button>
			<button
				on:click={() => {
					showQuitModal = true;
				}}
				class="flex items-center justify-center bg-slate-500 h-10 w-14 rounded-lg hover:bg-yellow-500"
			>
				<Icon src={Home} class="h-8 w-8 text-white" />
			</button>
		</div>
		<div class="flex items-center justify-center bg-slate-400 w-full min-h-[50px] rounded-lg">
			<h1 class="text-slate-100 text-3xl font-bold">{formatTime(playerTimeLeft)}</h1>
		</div>
	</div>
	<Modal bind:showModal={showRulesModal}>
		<div class="grid justify-items-center w-full">RULES HERE</div>
	</Modal>
	<Modal bind:showModal={showSurrenderModal}>
		<div class="grid justify-items-center w-full">
			<div class="text-4xl text-center text-slate-500 font-black drop-shadow-md">
				ARE YOU SURE YOU WANT TO SURRENDER?
			</div>
			<div class="p-6 flex justify-center">
				<button
					class="mx-2 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-700 font-black text-lg text-white"
					on:click={() => {
						showSurrenderModal = false;
					}}
				>
					CANCEL
				</button>
				<button
					class="mx-2 px-4 py-2 rounded-lg font-black text-lg text-white bg-emerald-500 hover:bg-emerald-700"
					on:click={handleSurrender}
				>
					CONFIRM
				</button>
			</div>
		</div>
	</Modal>
	<Modal bind:showModal={showQuitModal}>
		<div class="grid justify-items-center w-full">
			<div class="text-4xl text-center text-slate-500 font-black drop-shadow-md">
				ARE YOU SURE YOU WANT TO QUIT?
			</div>
			<div class="p-6 flex justify-center">
				<button
					class="mx-2 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-700 font-black text-lg text-white"
					on:click={() => {
						showQuitModal = false;
					}}
				>
					CANCEL
				</button>
				<button
					class="mx-2 px-4 py-2 rounded-lg font-black text-lg text-white bg-emerald-500 hover:bg-emerald-700"
					on:click={handleLeave}
				>
					CONFIRM
				</button>
			</div>
		</div>
	</Modal>
	<Modal bind:showModal={isGameOver}>
		<div class="grid justify-items-center w-full">
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
