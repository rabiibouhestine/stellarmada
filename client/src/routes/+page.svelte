<script>
	import { goto } from '$app/navigation';
	import ShortUniqueId from 'short-unique-id';

	let isSingleDisabled = false;
	let isMatchmakingDisabled = false;
	let isRoomDisabled = false;

	function findRoom() {
		isMatchmakingDisabled = true;
		goto('/matchmaking');
	}

	function createRoom() {
		isRoomDisabled = true;
		const roomID = new ShortUniqueId().rnd();
		goto(`/${roomID}`);
	}

	async function botRoom() {
		isSingleDisabled = true;
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
			<h1 class="text-3xl md:text-6xl text-center text-slate-100 font-black drop-shadow-md">
				<span>STELL</span><span class="text-slate-400">AR</span><span>MADA</span>
			</h1>
			<h1 class="text-xl text-center text-slate-300 drop-shadow-md">
				A dueling card game inspired by the mechanics of Regicide
			</h1>
		</div>
		<button
			class="w-1/2 mt-4 px-4 py-2 rounded-lg bg-white bg-opacity-20 hover:bg-apollo-blue-400 font-black text-md md:text-lg text-white text-center"
			disabled={isMatchmakingDisabled}
			on:click={findRoom}
		>
			FIND A GAME
		</button>
		<button
			class="w-1/2 mt-4 px-4 py-2 rounded-lg bg-white bg-opacity-20 hover:bg-apollo-blue-400 font-black text-md md:text-lg text-white text-center"
			disabled={isRoomDisabled}
			on:click={createRoom}
		>
			CREATE A ROOM
		</button>
		<button
			class="w-1/2 mt-4 px-4 py-2 rounded-lg bg-white bg-opacity-20 hover:bg-apollo-blue-400 font-black text-md md:text-lg text-white text-center"
			disabled={isSingleDisabled}
			on:click={botRoom}
		>
			PLAY AGAINST BOT
		</button>
		<a
			class="w-1/2 mt-4 px-4 py-2 rounded-lg bg-apollo-blue-300 hover:bg-apollo-blue-400 font-black text-md md:text-lg text-white text-center"
			href="/gamerules"
		>
			RULES
		</a>
	</div>
</div>
