<script>
	import '../app.css';
	import io from 'socket.io-client';
	import { socket } from '$lib/modules/stores.js';
	import { browser } from '$app/environment';

	export let data;

	if (browser) {
		socket.set(
			io.connect('http://localhost:3001', {
				query: {
					userID: data.userID
				}
			})
		);
	}
</script>

<slot />

<style lang="postcss">
	:global(html) {
		@apply bg-black;
	}
</style>
