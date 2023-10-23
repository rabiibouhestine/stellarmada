<script>
	import { afterUpdate } from 'svelte';

	const playerID = localStorage.getItem('playerID');

	export let moves;

	let messagesDiv;

	afterUpdate(() => {
		messagesDiv.scrollTo(0, messagesDiv.scrollHeight);
	});

	const getLogColorClass = (id, playerID) => {
		if (id === playerID) {
			return 'bg-apollo-blue-400';
		} else {
			return 'bg-apollo-yellow-300';
		}
	};

	const getCardColorClass = (cardName) => {
		const suit = cardName[1];
		switch (suit) {
			case 'H':
				return 'bg-apollo-pink-100 text-apollo-pink-500';
				break;
			case 'D':
				return 'bg-apollo-green-200 text-apollo-green-500';
				break;
			case 'S':
				return 'bg-apollo-yellow-100 text-apollo-yellow-500';
				break;
			case 'C':
				return 'bg-apollo-blue-200 text-apollo-blue-500';
				break;
			default:
				return 'bg-apollo-grey-200 text-apollo-grey-500';
		}
	};

	const getMoveName = (move) => {
		switch (move.location + '-' + move.destination) {
			case 'graveyard-tavern':
				return 'revived';
			case 'tavern-hand':
				return 'drew';
			case 'tavern-rearguard':
				return 'stealthed';
			case 'frontline-graveyard':
				return 'retreated';
			case 'frontline-castle':
				return 'retreated and lost';
			case 'rearguard-graveyard':
				return 'stealth countered with';
			case 'rearguard-castle':
				return 'stealth countered and lost';
			case 'hand-graveyard':
				return 'countered with';
			case 'hand-castle':
				return 'countered and lost';
			case 'hand-frontline':
				return 'attacked with';
			case 'rearguard-frontline':
				return 'stealth attacked with';
			default:
				return 'played';
		}
	};

	const getCardSuit = (cardName) => {
		const value = cardName[0];
		const suit = cardName[1];
		switch (suit) {
			case 'H':
				return value + '♥';
			case 'S':
				return value + '♠';
			case 'C':
				return value + '♣';
			case 'D':
				return value + '♦';
			default:
				return cardName;
		}
	};
</script>

<div class="justify-between flex flex-col h-full overflow-y-auto">
	<div
		id="messages"
		class="flex flex-col space-y-2 p-2 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch"
		bind:this={messagesDiv}
	>
		{#each moves as move}
			<div
				class="px-4 py-2 space-y-2 w-full rounded-lg bg-opacity-40
				{getLogColorClass(move.playerID, playerID)}"
			>
				<div class="text-sm text-white">
					{#if move.playerID === playerID}
						You {getMoveName(move)} {move.cardsNames.length} ships!
					{:else}
						Enemy {getMoveName(move)} {move.cardsNames.length} ships!
					{/if}
				</div>
				<div class="flex flex-column space-x-1 text-xs font-extrabold">
					{#each move.cardsNames as cardName}
						<div
							class="flex px-1 py-2 w-full justify-center content-center rounded-lg
							{getCardColorClass(cardName)} bg-opacity-80"
						>
							{getCardSuit(cardName)}
						</div>
					{/each}
				</div>
			</div>
		{/each}
	</div>
</div>

<style>
	.scrollbar-w-2::-webkit-scrollbar {
		width: 0.25rem;
		height: 0.25rem;
	}

	.scrollbar-track-blue-lighter::-webkit-scrollbar-track {
		--bg-opacity: 1;
		background-color: #696969;
		background-color: rgba(0, 0, 0, 0.2);
	}

	.scrollbar-thumb-blue::-webkit-scrollbar-thumb {
		--bg-opacity: 1;
		background-color: #2a2a2a;
		background-color: rgba(0, 0, 0, 0.5);
	}

	.scrollbar-thumb-rounded::-webkit-scrollbar-thumb {
		border-radius: 0.25rem;
	}
</style>
