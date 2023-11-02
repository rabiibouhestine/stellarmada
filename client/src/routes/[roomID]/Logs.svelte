<script>
	import { afterUpdate } from 'svelte';

	export let data;
	export let logs;

	const socket = data.socket;
	const playerID = data.playerID;

	let logsDiv;

	afterUpdate(() => {
		logsDiv.scrollTo(0, logsDiv.scrollHeight);
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

	const processCardName = (cardName) => {
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

	const handlePlural = (text, number) => {
		if (number > 1) {
			return text + 's';
		} else {
			return text;
		}
	};
</script>

<div class="justify-between flex flex-col h-full overflow-y-auto">
	<div
		id="messages"
		class="flex flex-col space-y-2 p-2 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch"
		bind:this={logsDiv}
	>
		{#each logs as log}
			<div
				class="px-4 py-2 space-y-2 w-full rounded-lg bg-opacity-40
				{getLogColorClass(log.playerID, playerID)}"
			>
				<div class="text-sm text-white">
					{#if log.playerID === playerID}
						You {log.move}ed with {log.cardsNames.length}
						{handlePlural('card', log.cardsNames.length)}:
					{:else}
						Enemy {log.move}ed with {log.cardsNames.length}
						{handlePlural('card', log.cardsNames.length)}:
					{/if}
				</div>
				<div class="flex flex-column space-x-1 text-xs font-extrabold">
					{#each log.cardsNames as cardName}
						<div
							class="flex px-1 py-2 w-full justify-center content-center rounded-lg
							{getCardColorClass(cardName)} bg-opacity-80"
						>
							{processCardName(cardName)}
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
