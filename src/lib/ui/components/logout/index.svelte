<script lang="ts">
	import { enhance } from '$app/forms';
	import { computePosition, shift, offset, autoUpdate } from '@floating-ui/dom';
	import LogOut from 'lucide-svelte/icons/log-out';

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

<form method="POST" action="/logout" use:enhance>
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
