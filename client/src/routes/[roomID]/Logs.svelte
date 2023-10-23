<script>
	// const el = document.getElementById('messages');
	// el.scrollTop = el.scrollHeight;
	const actionLogs = [1, 2, 3, 4, 5, 6, 7, 8, 9];
</script>

<div class="justify-between flex flex-col h-full overflow-y-auto">
	<div
		id="messages"
		class="flex flex-col space-y-2 p-2 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch"
	>
		{#each actionLogs as actionLog}
			<div class="chat-message">
				<span
					class="px-4 py-2 w-full rounded-lg inline-block bg-apollo-blue-400 bg-opacity-40 text-sm text-white"
					>You played 4 cards.</span
				>
			</div>
			<div class="chat-message">
				<span
					class="px-4 py-2 w-full rounded-lg inline-block bg-apollo-yellow-300 bg-opacity-40 text-sm text-white"
					>Enemy discarded 3 cards.</span
				>
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
