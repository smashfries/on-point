<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<div class="bg-zinc-100 dark:bg-zinc-900 w-screen h-screen overflow-scroll">
	{@render children()}
</div>