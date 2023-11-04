<script>
	import { page } from '$app/stores';
</script>

<div class="grid justify-items-center text-white">
	<h1 class="text-9xl">ERROR BIAAATCH</h1>
	<h1 class="text-xl">{$page.error.message}</h1>
</div>
