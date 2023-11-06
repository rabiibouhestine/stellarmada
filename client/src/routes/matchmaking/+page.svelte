<script>
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import io from 'socket.io-client';

	export let data;

	const playerID = data.userID;

	const socket = io.connect('http://localhost:3001', {
		query: {
			playerID: playerID
		}
	});

	socket.emit('findGame');

	onMount(() => {
		socket.on('gameFound', (data) => {
			goto(`/${data.roomID}`);
		});

		return () => {
			socket.off('gameFound');
			socket.disconnect();
		};
	});

	function goHome() {
		goto('/');
	}
</script>

<div
	class="flex items-center justify-center h-screen bg-gradient-to-t from-apollo-blue-500 to-black"
>
	<div class="grid justify-items-center">
		<div class="mb-15 p-6">
			<h1 class="text-2xl text-center text-slate-100 font-black drop-shadow-md">
				LOOKING FOR A GAME...
			</h1>
		</div>
		<button
			class="w-1/2 mt-4 px-4 py-2 rounded-lg bg-apollo-blue-300 hover:bg-apollo-blue-400 font-black text-lg text-white"
			on:click={goHome}
		>
			QUIT
		</button>
	</div>
</div>
