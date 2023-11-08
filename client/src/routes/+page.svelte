<script>
	import { goto } from '$app/navigation';
	import ShortUniqueId from 'short-unique-id';

	function findRoom() {
		goto('/matchmaking');
	}

	function createRoom() {
		const roomID = new ShortUniqueId().rnd();
		goto(`/${roomID}`);
	}

	async function botRoom() {
		const response = await fetch('http://localhost:3001/single');
		const data = await response.json();
		await goto(`/${data.roomID}`);
	}
</script>

<div
	class="flex items-center justify-center h-screen bg-gradient-to-t from-apollo-blue-500 to-black"
>
	<div class="grid justify-items-center">
		<div class="mb-15 p-6">
			<h1 class="text-6xl text-center text-slate-100 font-black drop-shadow-md">
				<span>STELL</span><span class="text-slate-400">AR</span><span>MADA</span>
			</h1>
			<h1 class="text-xl text-center text-slate-300 drop-shadow-md">
				This website is still under construction!
			</h1>
		</div>
		<button
			class="w-1/2 mt-4 px-4 py-2 rounded-lg bg-white bg-opacity-20 hover:bg-apollo-blue-400 font-black text-lg text-white text-center"
			on:click={findRoom}
		>
			FIND A GAME
		</button>
		<button
			class="w-1/2 mt-4 px-4 py-2 rounded-lg bg-white bg-opacity-20 hover:bg-apollo-blue-400 font-black text-lg text-white text-center"
			on:click={createRoom}
		>
			CREATE A ROOM
		</button>
		<button
			class="w-1/2 mt-4 px-4 py-2 rounded-lg bg-white bg-opacity-20 hover:bg-apollo-blue-400 font-black text-lg text-white text-center"
			on:click={botRoom}
		>
			PLAY AGAINST AI
		</button>
		<a
			class="w-1/2 mt-4 px-4 py-2 rounded-lg bg-apollo-blue-300 hover:bg-apollo-blue-400 font-black text-lg text-white text-center"
			href="/gamerules"
		>
			RULES
		</a>
	</div>
</div>
