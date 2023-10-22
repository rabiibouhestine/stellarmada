<script>
	// const el = document.getElementById('messages');
	// el.scrollTop = el.scrollHeight;
	const playerMessages = [1, 2, 3, 4, 5, 6, 7, 8, 9];
</script>

<div class="justify-between flex flex-col h-full overflow-y-auto">
	<div
		id="messages"
		class="flex flex-col space-y-2 p-2 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch"
	>
		{#each playerMessages as playerMessage}
			<div class="chat-message">
				<div class="flex flex-col space-y-2 text-sm max-w-xs order-2 items-start">
					<div>
						<span
							class="px-4 py-2 rounded-lg inline-block rounded-bl-none bg-[#be772b] bg-opacity-40 text-sm text-white"
							>I am gonna win this game eaaaaaaasy!!</span
						>
					</div>
				</div>
			</div>
			<div class="chat-message">
				<div class="flex flex-col space-y-2 text-sm max-w-xs order-1 items-end">
					<div>
						<span
							class="px-4 py-2 rounded-lg inline-block rounded-br-none bg-[#3c5e8b] bg-opacity-40 text-sm text-white"
							>We will see about that. I have a very good hand. Prepare yourslef to be humiliated
							and destroyed.</span
						>
					</div>
				</div>
			</div>
		{/each}
	</div>
	<div class="flex space-x-2 border-t-2 border-gray-200 px-2 py-2">
		<input
			type="text"
			placeholder="Write your message!"
			class="w-full focus:outline-none focus:placeholder-gray-400 placeholder-white px-4 py-2 bg-white bg-opacity-10 text-sm text-white rounded-md"
		/>
		<button
			type="button"
			class="inline-flex items-center justify-center rounded-lg px-4 py-2 text-white bg-[#253a5e] hover:bg-[#3c5e8b] focus:outline-none"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 20 20"
				fill="currentColor"
				class="h-6 w-6 transform rotate-90"
			>
				<path
					d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"
				/>
			</svg>
		</button>
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
