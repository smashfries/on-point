<script lang="ts">
	import Logout from '$lib/ui/components/logout/index.svelte';
	import ChevronLeft from 'lucide-svelte/icons/chevron-left';
	import Check from 'lucide-svelte/icons/check';
	import type { PageData } from './$types';
	import { flip } from 'svelte/animate';

	let { data }: { data: PageData } = $props();

	let newTaskName: string = $state('');
	let tasks = $state(data.tasks);

	let selectedTaskId = $state('');

	async function createTask() {
		if (newTaskName === '') return;

		const id = crypto.randomUUID();
		const title = newTaskName;

		tasks.push({
			id,
			title,
			completed: false
		});

		newTaskName = '';

		try {
			const res = await fetch(`/projects/${data.project.id}/tasks`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					id,
					title
				})
			});

			if (!res.ok) {
				tasks = tasks.filter((task) => task.id !== id);
			}
		} catch (e) {
			console.log(e);

			tasks = tasks.filter((task) => task.id !== id);
		}
	}

	function createTaskKeyDown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			createTask();
		}
	}

	function toggleTaskCompletionStatus() {
		const id = selectedTaskId;
		const taskIndex = tasks.findIndex((task) => task.id === id);
		tasks[taskIndex].completed = !tasks[taskIndex].completed;

		if (tasks[taskIndex].completed) {
			setTimeout(() => {
				removeCompletedTask(id);
			}, 3000);
		}
	}

	function completeTaskKeyDown(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === 'Space') {
			toggleTaskCompletionStatus();
		}
	}

	async function removeCompletedTask(id: string) {
        const task = tasks.find((task) => task.id === id);
		if (task?.completed) {
            tasks = tasks.filter((task) => task.id !== id)

            try {
                const res = await fetch(`/projects/${data.project.id}/tasks/${id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        completed: true
                    })
                })

                if (!res.ok) {
                    tasks.push({...task, completed: false})
                }
            } catch (e) {
                console.log(e)

                tasks.push({...task, completed: false})
            }
		}
	}
</script>

<div class="mx-auto mt-5 max-w-7xl px-6">
	<a href="/projects" class="absolute -translate-x-10"
		><ChevronLeft class="size-10 pb-0.5 dark:text-zinc-50" /></a
	>
	<div class="flex items-center justify-between">
		<h1
			contenteditable="plaintext-only"
			class="flex grow cursor-text items-center gap-4 text-3xl font-medium tracking-tight outline-none dark:text-zinc-50"
		>
			{data.project.name}
		</h1>
		<Logout />
	</div>

	<div class="mt-2 grid grid-cols-12 gap-4">
		<div class="col-span-8 col-start-1">
			<div
				contenteditable="plaintext-only"
				class="cursor-text text-lg outline-none dark:text-zinc-100"
			>
				{data.project.description}
			</div>

			<div
				class="mt-10 min-h-96 w-full rounded-t-xl bg-gradient-to-b from-zinc-200 to-transparent p-2 dark:from-zinc-800 dark:to-zinc-900"
			>
				<p class="mt-10 text-center text-sm text-zinc-600 dark:text-zinc-300">
					Notepad coming soon...
				</p>
			</div>
		</div>
		<div class="col-span-4 col-end-13 flex flex-col gap-2">
			<input
				onkeydown={createTaskKeyDown}
				bind:value={newTaskName}
				type="text"
				placeholder="Add a task..."
				class="mb-6 h-9 w-full rounded-md border-zinc-200 bg-white text-sm text-zinc-800 outline-none transition-all duration-200 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-300 dark:border-transparent"
			/>
			{#each tasks as task (task.id)}
				<div
					animate:flip
					role="button"
					tabindex="0"
					onmouseenter={() => {
						selectedTaskId = task.id;
					}}
					onfocus={() => {
						selectedTaskId = task.id;
					}}
					onmouseleave={() => {
						selectedTaskId = '';
					}}
					onblur={() => {
						selectedTaskId = '';
					}}
					class="flex h-9 w-full cursor-default items-center rounded-md bg-white px-4 pl-8 text-sm text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200"
				>
					<div
						class="absolute {selectedTaskId === task.id || task.completed
							? 'opacity-1'
							: 'opacity-0'} size-4 translate-x-[-23px] transition-opacity duration-0"
					>
						<div
							tabindex="0"
							role="checkbox"
							aria-checked="false"
							onclick={toggleTaskCompletionStatus}
							onkeydown={completeTaskKeyDown}
							onfocus={() => {
								selectedTaskId = task.id;
							}}
							onblur={() => {
								selectedTaskId = '';
							}}
							class="flex h-full w-full items-center justify-center rounded-full {task.completed
								? 'dark:bg-zinc-300'
								: 'border border-zinc-300 dark:border-zinc-500'}"
						>
							<Check
								class="h-full w-full p-0.5 transition duration-200 {task.completed
									? 'dark:text-zinc-700'
									: 'text-transparent hover:text-zinc-300'}"
							/>
						</div>
					</div>
					<span class="truncate">
						{task.title}
					</span>
				</div>
			{/each}

			{#if tasks.length === 0}
				<p class="text-center text-sm text-zinc-600 dark:text-zinc-300">
					Start adding tasks, and get to work!
				</p>
			{/if}
		</div>
	</div>
</div>
