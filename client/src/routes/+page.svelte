<script>
	import { socket } from '$lib/modules/socket.js';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	const createRoom = () => {
		socket.emit('createRoom');
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

<div class="flex items-center justify-center h-screen bg-gradient-to-t from-[#253a5e] to-[#000000]">
	<div class="grid justify-items-center">
		<div class="mb-15 p-6">
			<h1 class="text-6xl text-center text-slate-100 font-black drop-shadow-md">FLEET GAMBIT</h1>
		</div>
		<!-- <button
			class="w-1/2 mt-4 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 font-black text-lg text-white"
		>
			PLAY AGAINST AI
		</button> -->
		<button
			class="w-1/2 mt-4 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-black text-lg text-white"
			on:click={createRoom}
		>
			CREATE A ROOM
		</button>
	</div>
</div>
