<script>
	import '../app.css';
</script>

<slot />

<svelte:head>
	<!-- Google tag (gtag.js) -->
	<!-- Google tag (gtag.js) -->
	<script async src="https://www.googletagmanager.com/gtag/js?id=G-K2T33GJFES"></script>
	<script>
		window.dataLayer = window.dataLayer || [];
		function gtag() {
			dataLayer.push(arguments);
		}
		gtag('js', new Date());

		gtag('config', 'G-K2T33GJFES');
	</script>
</svelte:head>

<style lang="postcss">
	:global(html) {
		@apply bg-black;
	}
</style>
