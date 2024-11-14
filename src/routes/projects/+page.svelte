<script lang="ts">
    import type { PageData } from './$types';
	import LogOut from 'lucide-svelte/icons/log-out';
	import { computePosition, shift, offset, autoUpdate } from '@floating-ui/dom';

	let {data}: {data: PageData} = $props();

	let logoutButton: HTMLButtonElement;
	let logoutButtonTooltip: HTMLDivElement;
	let showLogoutButtonTooltip = $state(false);

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

<div class="mx-auto mt-5 max-w-7xl">
	<div class="flex items-center justify-between">
		<h1 class="text-3xl font-medium tracking-tight dark:text-zinc-50">Projects</h1>
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
			href="#"
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
