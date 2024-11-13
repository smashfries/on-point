<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<div class="mt-10 text-center">
	<a href="/" class="text-4xl font-medium italic tracking-tighter text-zinc-800 dark:text-zinc-200"
		>on point</a
	>
</div>

<div class="w-md mx-auto mt-5 flex flex-col gap-2 text-center">
	<p class="text-zinc-600 dark:text-zinc-300">Track the progress and status of your projects.</p>
	<p class="text-zinc-600 dark:text-zinc-300">
		Write it down, and then get it done. No distractions!
	</p>
</div>

<div class="w-md mx-auto mt-20 text-center">
	<p class="text-zinc-600 dark:text-zinc-300">
		A minimal tool that just works. Free and open source forever.
	</p>
	<div class="mt-3 flex justify-center gap-4">
		{#if !data.loggedIn}
			<a
				href="/login"
				class="flex h-10 items-center rounded-md border bg-white px-4 text-sm text-zinc-700 dark:border-transparent dark:bg-zinc-700 dark:text-zinc-50"
				>Log in</a
			>
			<a
				href="/signup"
				class="flex h-10 items-center rounded-md bg-zinc-700 px-4 text-sm text-zinc-50 dark:bg-zinc-50 dark:text-zinc-700"
				>Sign up</a
			>
		{:else}
			<a
				href="/projects"
				class="flex h-10 items-center rounded-md bg-zinc-700 px-4 text-sm text-zinc-50 dark:bg-zinc-50 dark:text-zinc-700"
				>Go to projects</a
			>
		{/if}
	</div>
</div>
