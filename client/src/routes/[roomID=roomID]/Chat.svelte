<script>
	import { onMount, afterUpdate } from 'svelte';
	import { page } from '$app/stores';
	import { socket } from '$lib/modules/stores.js';

	let playerID;

	let messages = [
		{
			playerID: '',
			content: 'I am gonna win this battle!!'
		},
		{
			playerID: playerID,
			content: 'We will see about that..'
		}
	];

	let messagesDiv;
	let messageInput = '';

	onMount(() => {
		playerID = $socket.id;

		$socket.on('messageResponse', (data) => {
			messages = [...messages, data.message];
		});

		return () => {
			$socket.off('messageResponse');
		};
	});

	afterUpdate(() => {
		messagesDiv.scrollTo(0, messagesDiv.scrollHeight);
	});

	const sendMessage = () => {
		if (messageInput !== '') {
			$socket.emit('messageRequest', {
				roomID: $page.params.roomID,
				message: { playerID: playerID, content: messageInput }
			});
			messageInput = '';
		}
	};

	const handleKeydown = (event) => {
		if (event.key === 'Enter' && event.target.value) {
			sendMessage();
		}
	};

	const getMessageClass = (id) => {
		if (id === playerID) {
			return 'rounded-br-none bg-apollo-blue-400';
		} else {
			return 'rounded-bl-none bg-apollo-yellow-300';
		}
	};

	const getMessageContainerClass = (id) => {
		if (id === playerID) {
			return 'items-end';
		} else {
			return 'items-start';
		}
	};
</script>

<div class="justify-between flex flex-col h-full overflow-y-auto">
	<div
		class="flex flex-col space-y-2 p-2 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch"
		bind:this={messagesDiv}
	>
		{#each messages as message}
			<div class="chat-message">
				<div
					class="flex flex-col space-y-2 text-sm max-w-xs order-2
					{getMessageContainerClass(message.playerID)}"
				>
					<div>
						<span
							class="px-4 py-2 rounded-lg inline-block
							{getMessageClass(message.playerID)} bg-opacity-40 text-sm text-white"
						>
							{message.content}
						</span>
					</div>
				</div>
			</div>
		{/each}
	</div>
	<div class="flex space-x-2 border-t-2 border-black border-opacity-20 px-2 py-2">
		<input
			type="text"
			placeholder="Write your message!"
			class="w-full focus:outline-none focus:placeholder-gray-400 placeholder-white px-4 py-2 bg-black bg-opacity-10 text-sm text-white rounded-md"
			bind:value={messageInput}
			on:keydown={handleKeydown}
		/>
		<button
			type="button"
			class="inline-flex items-center justify-center rounded-lg px-4 py-2 text-white bg-apollo-blue-500 hover:bg-apollo-blue-400 focus:outline-none"
			on:click={sendMessage}
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
