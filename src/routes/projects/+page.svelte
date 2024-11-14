<script lang="ts">
	import type { PageData } from './$types';
	import LogOut from 'lucide-svelte/icons/log-out';
	import Plus from 'lucide-svelte/icons/plus';
	import X from 'lucide-svelte/icons/x';
	import { computePosition, shift, offset, autoUpdate } from '@floating-ui/dom';

	let { data }: { data: PageData } = $props();

	let logoutButton: HTMLButtonElement;
	let logoutButtonTooltip: HTMLDivElement;
	let showLogoutButtonTooltip = $state(false);

	let newProjectDialog: HTMLDialogElement;
	let newProjectDialogOpen = $state(false);

	let cleanup: any;

	function updateTooltipPosition() {
		computePosition(logoutButton, logoutButtonTooltip, {
			middleware: [shift(), offset(7)]
		}).then(({ x, y }) => {
			Object.assign(logoutButtonTooltip.style, {
				left: `${x}px`,
				top: `${y}px`
			});
		});
	}

	function onLogoutButtonHover() {
		if (cleanup) return;
		logoutButtonTooltip.style.display = 'block';
		cleanup = autoUpdate(logoutButton, logoutButtonTooltip, updateTooltipPosition);
		showLogoutButtonTooltip = true;
	}

	function onLogoutButtonExit() {
		if (cleanup) {
			setTimeout(() => {
				logoutButtonTooltip.style.display = '';
			}, 200);
			cleanup();
			cleanup = null;
			showLogoutButtonTooltip = false;
		}
	}
</script>

<div class="mx-auto mt-5 max-w-7xl px-6">
	<div class="flex items-center justify-between">
		<h1 class="flex items-end gap-4 text-3xl font-medium tracking-tight dark:text-zinc-50">
			Projects <button
				onclick={() => {
					newProjectDialog.showModal();
					setTimeout(() => (newProjectDialogOpen = true)), 10;
				}}
				class="flex size-8 items-center justify-center rounded-full bg-zinc-700 dark:bg-zinc-50"
				><Plus class="px-0.5 text-zinc-50 dark:text-zinc-700" /></button
			>
		</h1>
		<form method="POST" action="/logout">
			<button
				type="submit"
				aria-label="Log out"
				onmouseenter={onLogoutButtonHover}
				onfocus={onLogoutButtonHover}
				onmouseleave={onLogoutButtonExit}
				onblur={onLogoutButtonExit}
				bind:this={logoutButton}
				aria-describedby="logout-tooltip"><LogOut class="size-5 dark:text-zinc-50" /></button
			>
		</form>
		<div
			bind:this={logoutButtonTooltip}
			id="logout-tooltip"
			role="tooltip"
			class="absolute left-0 top-0 hidden w-fit rounded-md bg-zinc-700 p-1 px-2 text-xs text-zinc-50 shadow-md transition duration-200 dark:bg-zinc-700 dark:text-zinc-50 {showLogoutButtonTooltip
				? 'opacity-1 translate-y-0'
				: 'translate-y-2 opacity-0'}"
		>
			Log out
		</div>
	</div>

	<div class="mt-10 flex flex-wrap gap-5">
		{#each data.projects as project (project.id)}
			<a
				href={`/projects/${project.id}`}
				class="flex h-24 w-72 items-stretch gap-2 rounded-md border bg-slate-50 p-1 shadow-sm dark:border-transparent dark:bg-zinc-700 dark:text-zinc-50"
			>
				<div class="flex h-full w-1 rounded-md bg-red-100"></div>
				<div>
					<h2 class="text-lg font-medium tracking-tight">Trelae</h2>
					<p class="text-sm text-gray-600 dark:text-zinc-200">Better business software</p>
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
	oncancel={(e) => {e.preventDefault(); newProjectDialogOpen = false; setTimeout(() => newProjectDialog.close(), 200)}}
	onclick={(e) => {
		const dialogDimensions = newProjectDialog.getBoundingClientRect();
		if (e.clientX < dialogDimensions.left ||
			e.clientX > dialogDimensions.right ||
			e.clientY < dialogDimensions.top ||
			e.clientY > dialogDimensions.bottom
		) {
			newProjectDialogOpen = false;
			setTimeout(() => newProjectDialog.close(), 200)
		}
	}}
>
	<button onclick={() => {newProjectDialogOpen = false; setTimeout(() => newProjectDialog.close(), 200)}} class="absolute top-0 right-0 -translate-x-1 translate-y-1"><X class="text-zinc-50 size-4" /></button>
	<form method="POST">
		<div class="mb-7 flex flex-col gap-2">
			<label class="text-lg font-medium tracking-tight">A short name to identify your project</label
			>
			<input
				type="text"
				name="name"
				required
				placeholder="Project name"
				class="h-10 w-full rounded-md border-zinc-200 text-sm text-zinc-700 outline-none transition-all duration-200 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-300 dark:border-transparent dark:bg-zinc-100"
			/>
		</div>
		<div class="mb-5 flex flex-col gap-2">
			<label class="text-lg font-medium tracking-tight"
				>A clear, concise description of your project</label
			>
			<textarea
				name="description"
				placeholder="Project description"
				class="h-20 w-full rounded-md border-zinc-200 text-sm text-zinc-700 outline-none transition-all duration-200 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-300 dark:border-transparent dark:bg-zinc-100"
			/>
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
		backdrop-filter: blur(5px);
		-webkit-backdrop-filter: blur(5px);
	}

	dialog.visible::backdrop {
		opacity: 1;
	}
</style>
