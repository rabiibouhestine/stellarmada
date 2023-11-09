<script>
	import screenfull from 'screenfull';
	import { onMount } from 'svelte';
	import {
		Icon,
		Home,
		Flag,
		SpeakerWave,
		SpeakerXMark,
		ArrowsPointingOut,
		ArrowsPointingIn
	} from 'svelte-hero-icons';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import Timer from '$lib/modules/Timer.js';
	import Modal from '$lib/components/Modal.svelte';
	import Chat from './Chat.svelte';
	import Logs from './Logs.svelte';
	import { Game } from '../../game/Game.js';

	export let socket;
	export let playerID;

	socket.emit('gameStateRequest', {
		roomID: $page.params.roomID
	});

	const playerTimer = new Timer(1000 * 60 * 10, playerTimeUpdate);
	const opponentTimer = new Timer(1000 * 60 * 10, opponentTimeUpdate);

	let canvas;
	let winnerID;
	let isMuted = false;
	let isFullScreen = false;
	let isGameOver = false;
	let showSurrenderModal = false;
	let showQuitModal = false;
	let playerTimeLeft = playerTimer.timeLeft;
	let opponentTimeLeft = opponentTimer.timeLeft;

	let game;
	let logs = [];
	let messages = [];

	$: fullScreenIcon = isFullScreen ? ArrowsPointingIn : ArrowsPointingOut;
	$: soundIcon = isMuted ? SpeakerXMark : SpeakerWave;

	onMount(() => {
		window.addEventListener('confirmButtonClicked', onConfirmButtonClicked);

		socket.on('gameStateResponse', (data) => {
			game = new Game(canvas, data.gameState, playerID, isMuted);
			logs = data.gameState.logs;
			messages = data.messages;

			// update timers
			for (const id in data.timeLeft) {
				const timeLeft = data.timeLeft[id].timeLeft;
				const isRunning = data.timeLeft[id].isRunning;
				if (id === playerID) {
					playerTimer.reset(timeLeft, isRunning);
				} else {
					opponentTimer.reset(timeLeft, isRunning);
				}
			}
		});

		socket.on('gameActionResponse', (data) => {
			game.update(data.gameAction);
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

		socket.on('gameEnded', (data) => {
			isGameOver = true;
			winnerID = data.winnerID;
			playerTimer.stop();
			opponentTimer.stop();
		});

		return () => {
			window.removeEventListener('confirmButtonClicked', onConfirmButtonClicked);
			socket.off('gameStateResponse');
			socket.off('gameActionResponse');
			socket.off('gameEnded');
			game.end();
		};
	});

	function onConfirmButtonClicked() {
		const selectedCards = game.players[playerID].hand.cards
			.filter((card) => card.selected)
			.map((card) => card.name);

		socket.emit('gameActionRequest', {
			roomID: $page.params.roomID,
			playerSelection: selectedCards
		});
	}

	function formatTime(milliseconds) {
		const totalSeconds = Math.floor(milliseconds / 1000);
		const minutes = Math.floor(totalSeconds / 60);
		const seconds = totalSeconds % 60;

		const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
		const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;

		return `${formattedMinutes}:${formattedSeconds}`;
	}

	function toggleSound() {
		isMuted = !isMuted;
		game.toggleMute(isMuted);
	}

	function toggleFullScreen() {
		if (screenfull.isEnabled) {
			isFullScreen = !isFullScreen;
			screenfull.toggle();
		}
	}

	function handleSurrender() {
		showSurrenderModal = false;
		socket.emit('surrenderRequest', { roomID: $page.params.roomID });
	}

	function handleRematch() {
		showSurrenderModal = false;
		socket.emit('rematchRequest', { roomID: $page.params.roomID });
	}

	function handleLeave() {
		showQuitModal = false;
		goto('/');
	}

	function playerTimeUpdate(timeLeft) {
		playerTimeLeft = timeLeft;
	}

	function opponentTimeUpdate(timeLeft) {
		opponentTimeLeft = timeLeft;
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
			<Logs {logs} {playerID} />
		</div>
	</div>
	<div bind:this={canvas} id="pixi-container" class="min-w-0 aspect-square" />
	<div class="flex flex-col min-w-[300px] max-w-[300px] p-5 space-y-5">
		<div class="bg-black bg-opacity-25 w-full h-full rounded-xl overflow-y-auto">
			<Chat {socket} {playerID} {messages} />
		</div>
		<div
			class="flex flex-row items-center justify-center bg-black bg-opacity-25 rounded-lg space-x-4 min-h-[60px] w-full"
		>
			<button
				on:click={toggleSound}
				class="flex items-center justify-center bg-black bg-opacity-25 h-10 w-12 rounded-lg hover:bg-apollo-yellow-300"
			>
				<Icon src={soundIcon} class="h-8 w-8 text-white" />
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
				on:click={toggleFullScreen}
				class="flex items-center justify-center bg-black bg-opacity-25 h-10 w-12 rounded-lg hover:bg-apollo-green-300"
			>
				<Icon src={fullScreenIcon} class="h-8 w-8 text-white" />
			</button>
		</div>
		{#if false}
			<div class="bg-black bg-opacity-25 w-full min-h-[260px] rounded-lg" />
		{/if}
		<div
			class="flex items-center justify-center bg-black bg-opacity-25 w-full min-h-[50px] rounded-lg"
		>
			<h1 class="text-slate-100 text-3xl font-bold">{formatTime(playerTimeLeft)}</h1>
		</div>
	</div>
	<Modal
		bind:showModal={showSurrenderModal}
		on:confirm={handleSurrender}
		title="ARE YOU SURE YOU WANT TO SURRENDER?"
		closeButtonLabel="CANCEL"
		confirmButtonLabel="CONFIRM"
	/>
	<Modal
		bind:showModal={showQuitModal}
		on:confirm={handleLeave}
		title="ARE YOU SURE YOU WANT TO QUIT?"
		closeButtonLabel="CANCEL"
		confirmButtonLabel="CONFIRM"
	/>
	<Modal
		bind:showModal={isGameOver}
		on:confirm={handleRematch}
		on:close={handleLeave}
		title={winnerID === playerID ? 'You Won !!!' : 'You lost...'}
		closeButtonLabel="LEAVE"
		confirmButtonLabel="REMATCH"
	/>
</div>
