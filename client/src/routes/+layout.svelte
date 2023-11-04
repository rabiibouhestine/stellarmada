<script>
	import '../app.css';
	import io from 'socket.io-client';
	import { socketStore } from '$lib/modules/stores.js';
	import { browser } from '$app/environment';

	export let data;

	if (browser) {
		socketStore.set(
			io.connect('https://server.stellarmada.com', {
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
