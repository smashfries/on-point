<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import Plus from 'lucide-svelte/icons/plus';
	import X from 'lucide-svelte/icons/x';
	import Logout from '$lib/ui/components/logout/index.svelte';
	import { enhance } from '$app/forms';

	let { data, form }: { data: PageData, form: ActionData } = $props();


	let newProjectDialog: HTMLDialogElement;
	let newProjectDialogOpen = $state(false);

	$effect(() => {
		if (form?.success) {
			closeNewProjectDialog()
		}
	})

	function closeNewProjectDialog() {
 		newProjectDialogOpen = false;
		setTimeout(() => newProjectDialog.close(), 200)
	}

</script>

<svelte:head>
	<title>Projects | on point</title>
</svelte:head>

<div class="mx-auto mt-5 max-w-7xl px-10">
	<div class="flex items-center justify-between">
		<h1 class="flex items-center gap-4 text-3xl font-medium tracking-tight dark:text-zinc-50">
			Projects <button
				onclick={() => {
					newProjectDialog.showModal();
					setTimeout(() => (newProjectDialogOpen = true)), 10;
				}}
				><Plus class="bg-zinc-700 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-700 rounded-full p-1 size-8" /></button 
			>
		</h1>
		<Logout />
	</div>

	<div class="mt-10 flex flex-wrap gap-5">
		{#each data.projects as project (project.id)}
			<a
				href={`/projects/${project.id}`}
				class="flex h-24 w-64 items-stretch gap-2 rounded-md border bg-slate-50 p-1 shadow-sm dark:border-transparent dark:bg-zinc-700 dark:text-zinc-50"
			>
				<div class="flex h-full w-1 rounded-md bg-red-100"></div>
				<div>
					<h2 class="text-lg font-medium tracking-tight">{project.name}</h2>
					<p class="text-sm text-gray-600 dark:text-zinc-200">{project.description}</p>
				</div>
			</a>
		{/each}
	</div>
</div>

<dialog
	bind:this={newProjectDialog}
	class="w-96 rounded-md p-5 text-zinc-800 shadow-md dark:bg-zinc-700 dark:text-zinc-50 {newProjectDialogOpen
		? 'visible'
		: ''}"
	oncancel={(e) => {e.preventDefault(); closeNewProjectDialog()}}
	onclick={(e) => {
		const dialogDimensions = newProjectDialog.getBoundingClientRect();
		if (e.clientX < dialogDimensions.left ||
			e.clientX > dialogDimensions.right ||
			e.clientY < dialogDimensions.top ||
			e.clientY > dialogDimensions.bottom
		) {
			closeNewProjectDialog()
		}
	}}
>
	<button onclick={closeNewProjectDialog} class="absolute top-0 right-0 -translate-x-1 translate-y-1"><X class="dark:text-zinc-50 size-4" /></button>
	<form method="POST" use:enhance>
		<div class="mb-7 flex flex-col gap-2">
			<label for="name" class="text-lg font-medium tracking-tight">A short name to identify your project</label
			>
			<input
				type="text"
				id="name"
				name="name"
				required
				placeholder="Project name"
				class="h-10 w-full rounded-md border-zinc-200 text-sm text-zinc-700 outline-none transition-all duration-200 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-300 dark:border-transparent dark:bg-zinc-100"
			/>
		</div>
		<div class="mb-5 flex flex-col gap-2">
			<label for="description" class="text-lg font-medium tracking-tight"
				>A clear, concise description of your project</label
			>
			<textarea
				id="description"
				name="description"
				placeholder="Project description"
				class="h-20 w-full rounded-md border-zinc-200 text-sm text-zinc-700 outline-none transition-all duration-200 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-300 dark:border-transparent dark:bg-zinc-100"
			></textarea>
		</div>
		<div class="flex justify-end">
			<button
				type="submit"
				class="h-10 w-full rounded-md bg-blue-500 text-sm text-blue-50 transition-all duration-200 active:ring-2 active:ring-blue-300"
				>Create</button
			>
		</div>
	</form>
</dialog>

<style>
	dialog {
		opacity: 0;
		transform: translateY(10px);
		transition:
			opacity 0.2s ease,
			transform 0.2s ease;
	}

	dialog.visible {
		opacity: 1;
		transform: translateY(0);
	}

	dialog::backdrop {
		background: transparent;
		opacity: 0;
		transition: opacity 0.2s ease;
		backdrop-filter: blur(20px);
		-webkit-backdrop-filter: blur(20px);
	}

	dialog.visible::backdrop {
		opacity: 1;
	}
</style>
