<script>
	// const el = document.getElementById('messages');
	// el.scrollTop = el.scrollHeight;

	const playerID = localStorage.getItem('playerID');

	const moves = [
		{
			id: playerID,
			cardsNames: ['6C'],
			ncards: 2,
			location: 'hand',
			destination: 'frontline'
		},
		{
			id: 'id2',
			cardsNames: ['6C', '7H'],
			ncards: 1,
			location: 'hand',
			destination: 'frontline'
		},
		{
			id: playerID,
			cardsNames: ['6C', '5H', '2C', '4C', '9S', '4H'],
			ncards: 6,
			location: 'hand',
			destination: 'frontline'
		}
	];

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
</script>

<div class="justify-between flex flex-col h-full overflow-y-auto">
	<div
		id="messages"
		class="flex flex-col space-y-2 p-2 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch"
	>
		{#each moves as move}
			<div
				class="px-4 py-2 space-y-2 w-full rounded-lg {getLogColorClass(
					move.id,
					playerID
				)} bg-opacity-40"
			>
				<div class="text-sm text-white">
					{#if move.id === 'id1'}
						You played {move.ncards} cards
					{:else}
						Enemy played {move.ncards} cards
					{/if}
				</div>
				<div class="flex flex-column space-x-1 text-xs font-bold">
					{#each move.cardsNames as card}
						<div
							class="flex px-1 py-2 w-full justify-center content-center rounded-lg
							{getCardColorClass(card)} bg-opacity-80"
						>
							{card}
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
