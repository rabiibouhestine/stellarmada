<script>
	import { socket } from '$lib/modules/socket.js';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	const goHome = () => {
		goto('/');
	};

	onMount(() => {
		socket.on('createRoomResponse', (data) => {
			goto(`/${data.room.roomID}`);
		});

		return () => {
			socket.off('createRoomResponse');
		};
	});
</script>

<div
	class="flex items-center justify-center h-screen bg-gradient-to-t from-apollo-blue-500 to-black"
>
	<div class="grid justify-items-center">
		<div class="mb-15 p-6">
			<h1 class="text-2xl text-center text-slate-100 font-black drop-shadow-md">
				SCANING RADAR...
			</h1>
		</div>
		<button
			class="w-1/2 mt-4 px-4 py-2 rounded-lg bg-apollo-blue-300 hover:bg-apollo-blue-400 font-black text-lg text-white"
			on:click={goHome}
		>
			CANCEL
		</button>
	</div>
</div>
