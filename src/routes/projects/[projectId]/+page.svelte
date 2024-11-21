<script lang="ts">
	import Logout from '$lib/ui/components/logout/index.svelte';
	import ChevronLeft from 'lucide-svelte/icons/chevron-left';
	import Archive from 'lucide-svelte/icons/archive';
	import Flame from 'lucide-svelte/icons/flame';
	import X from 'lucide-svelte/icons/x';
	import Check from 'lucide-svelte/icons/check';
	import Trash from 'lucide-svelte/icons/trash';
	import Play from 'lucide-svelte/icons/play';
	import type { PageData } from './$types';
	import { flip } from 'svelte/animate';
	import { goto } from '$app/navigation';

	let { data }: { data: PageData } = $props();

	let newTaskName: string = $state('');

	type Task = {
		id: string;
		title: string;
		completed: boolean;
		order: number;
		el: HTMLButtonElement | null;
	};

	let tasks: Task[] = $state(
		[]
	);

	$effect(() => {
		tasks = data.tasks.map((task) => {
			return {
				...task,
				el: null
			}
		})
	})

	let selectedTaskId = $state('');

	let taskDialog: HTMLDialogElement;
	let taskDialogOpen = $state(false);

	let deleteProjectDialog: HTMLDialogElement;
	let deleteProjectDialogOpen = $state(false);

	async function createTask() {
		if (newTaskName === '') return;

		const id = crypto.randomUUID();
		const title = newTaskName;
		const order = tasks.length > 0 ? tasks[tasks.length - 1].order + 1000 : 1000;

		tasks.push({
			id,
			title,
			completed: false,
			order,
			el: null
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
					title,
					order
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

	function toggleTaskCompletionStatus(e: any = null) {
		if (e) {
			e.stopPropagation();
		}
		const id = selectedTaskId;
		const taskIndex = tasks.findIndex((task) => task.id === id);
		tasks[taskIndex].completed = !tasks[taskIndex].completed;

		if ((!data.showCompleted && tasks[taskIndex].completed) || (data.showCompleted && !tasks[taskIndex].completed)) {
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
		if (!task) return;

		if ((!data.showCompleted && task?.completed) || (data.showCompleted && !task?.completed)) {
			tasks = tasks.filter((task) => task.id !== id);

			try {
				const res = await fetch(`/projects/${data.project.id}/tasks/${id}`, {
					method: 'PATCH',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						completed: !data.showCompleted
					})
				});

				if (!res.ok) {
					tasks.push({ ...task, completed: data.showCompleted });
				}
			} catch (e) {
				console.log(e);

				tasks.push({ ...task, completed: data.showCompleted });
			}
		}
	}

	function selectTask(id: string) {
		if (taskDialogOpen) return;

		selectedTaskId = id;
	}

	function openTaskDialog(id: string) {
		console.log(id);
		taskDialog.showModal();

		setTimeout(() => {
			taskDialogOpen = true;
			selectedTaskId = id;
		}, 10);
	}

	function closeTaskDialog() {
		taskDialogOpen = false;
		setTimeout(() => taskDialog.close(), 200);
	}

	function openDeleteProjectDialog() {
		deleteProjectDialog.showModal();

		setTimeout(() => {
			deleteProjectDialogOpen = true;
		}, 10);
	}

	function closeDeleteProjectDialog() {
		deleteProjectDialogOpen = false;
		setTimeout(() => deleteProjectDialog.close(), 200);
	}

	let deletingTask = false;
	async function deleteTask() {
		if (deletingTask) return;

		deletingTask = true;
		let res;
		try {
			res = await fetch(`/projects/${data.project.id}/tasks/${selectedTaskId}`, {
				method: 'DELETE'
			});

			if (res.ok) {
				closeTaskDialog();

				tasks = tasks.filter((task) => task.id !== selectedTaskId);
				selectedTaskId = '';
				deletingTask = false;
			}
		} catch (e) {
			console.log(e);
		}
	}

	let deletingProject = false;
	async function deleteProject() {
		if (deletingProject) return;
		deletingProject = true;

		let res;
		try {
			res = await fetch(`/projects/${data.project.id}`, {
				method: 'DELETE'
			});

			if (res.ok) {
				goto('/projects');
			}
		} catch (e) {
			console.log(e);
		}
	}

	let draggedTask = null;
	let dragPosition = $state(-1);

	async function reOrderTask(task: Task) {

		const fromIndex = tasks.indexOf(task);
		const toIndex = fromIndex < dragPosition ? dragPosition - 1 : dragPosition
		tasks.splice(fromIndex, 1);
		tasks.splice(toIndex, 0, task);

		draggedTask = null;
		dragPosition = -1;

		let newOrder;
		let needsRebalancing = false;

		if (toIndex === 0) {
			newOrder = tasks[1].order - 1000;

			console.log(newOrder)
		} else if (toIndex === tasks.length - 1) {
			newOrder = tasks[tasks.length - 2].order + 1000
			console.log(newOrder)
		} else {
			const before = tasks[toIndex - 1];
			const after = tasks[toIndex + 1];

			newOrder = Math.floor((before.order + after.order) / 2)

			if (((newOrder - before.order) < 2) || (after.order - newOrder) < 2) {
				needsRebalancing = true;
			}
		}

		tasks[toIndex].order = newOrder;


		if (needsRebalancing) {
			// call api to bulk update task orders
			let order = 1000;
			for (const task of tasks) {
				task.order = order;
				order += 1000;
			}

			let res;
			try {
				res = await fetch(`/projects/${data.project.id}/tasks/${tasks[toIndex].id}`, {
					method: 'PATCH',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						order: newOrder
					})
				})

				res = await fetch(`/projects/${data.project.id}/tasks`, {
					method: 'PATCH'
				})
			} catch (e) {
				console.log(e)
			}
		} else {
			// call individual task update api to update order
			let res;
			try {
				res = await fetch(`/projects/${data.project.id}/tasks/${tasks[toIndex].id}`, {
					method: 'PATCH',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						order: newOrder
					})
				})
			} catch (e) {
				console.log(e)
			}
		}


	}
</script>

<svelte:head>
	<title>{data.project.name}</title>
</svelte:head>

<div class="mx-auto mt-5 max-w-7xl px-10">
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

			<div class="mb-5 mt-10 flex items-center gap-8">
				<div class="flex items-center gap-2">
					<button
						class="flex items-center gap-1 rounded-md bg-zinc-200 p-1 px-2 text-xs font-light text-zinc-950"
						><Flame strokeWidth="1.5" class="size-4" /> Stats</button
					>
					<button
						class="flex items-center gap-1 rounded-md bg-green-300 p-1 px-2 text-xs font-light text-green-950"
						><Archive strokeWidth="1.5" class="size-4" /> Archive</button
					>
				</div>
				<div>
					<button
						onclick={openDeleteProjectDialog}
						class="flex items-center gap-1 rounded-md bg-red-300 p-1 px-2 text-xs font-light text-red-950"
						><Trash strokeWidth="1.5" class="size-4" /> Delete</button
					>
				</div>
			</div>
			<div
				class="min-h-96 w-full rounded-t-xl bg-gradient-to-b from-zinc-200 to-transparent p-2 dark:from-zinc-800 dark:to-zinc-900"
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
			<div>
				<div class="flex gap-4 justify-center items-center p-1 tracking-tight rounded-md text-sm h-9">
					<a href={`/projects/${data.project.id}`} class="p-1 px-4 rounded-full {data.showCompleted ? 'dark:text-zinc-200 text-zinc-700' : 'dark:bg-zinc-300 dark:text-zinc-700 bg-zinc-700 text-zinc-100'}">Todo</a>
					<a href={`/projects/${data.project.id}?showCompleted`} class="p-1 px-4 rounded-full {data.showCompleted ? 'dark:bg-zinc-300 dark:text-zinc-700 bg-zinc-700 text-zinc-100' : 'dark:text-zinc-200 text-zinc-700'}">Done</a>
				</div>
				<div
					class="relative mb-1 h-1 w-full {dragPosition === 0
						? 'bg-blue-500'
						: 'bg-transparent'} rounded-md transition-colors duration-200"
				></div>
				{#each tasks as task, index (task.id)}
					<div
						animate:flip={{ delay: 0, duration: 200 }}
						class="flex flex-col gap-1 py-0"
						role="presentation"
						ondragenter={(e) => {
							dragPosition = index;
						}}
						ondragover={(e) => e.preventDefault()}
					>
						<button
							draggable={!data.showCompleted}
							ondragstart={(e) => {
								draggedTask = task;
							}}
							ondragend={(e) => {
								reOrderTask(task);
							}}
							bind:this={task.el}
							onmouseenter={() => {
								selectTask(task.id);
							}}
							onfocus={() => {
								selectTask(task.id);
							}}
							onmouseleave={() => {
								selectTask('');
							}}
							onblur={() => {
								selectTask('');
							}}
							class="flex h-9 w-full cursor-default items-center rounded-md bg-white px-4 pl-8 text-sm text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200"
							onclick={() => openTaskDialog(task.id)}
							onkeydown={(e) => e.key === 'Enter' && openTaskDialog(task.id)}
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
										? 'bg-zinc-500 dark:bg-zinc-300'
										: 'border border-zinc-300 dark:border-zinc-500'}"
								>
									<Check
										class="h-full w-full p-0.5 transition duration-200 {task.completed
											? 'text-zinc-50 dark:text-zinc-700'
											: 'text-transparent hover:text-zinc-300'}"
									/>
								</div>
							</div>
							<span class="truncate">
								{task.title}
							</span>
						</button>
						<div
							class="relative mb-1 h-1 w-full {dragPosition === index + 1
								? 'bg-blue-500'
								: 'bg-transparent'} rounded-md transition-colors duration-200"
						></div>
					</div>
				{/each}
				<div
					class="h-20 w-full"
					role="presentation"
					ondragenter={(e) => {
						console.log('entered final drag zone');
						dragPosition = tasks.length;
					}}
					ondragover={(e) => e.preventDefault()}
				></div>
			</div>

			{#if tasks.length === 0}
				<p class="text-center text-sm text-zinc-600 dark:text-zinc-300">
					Start adding tasks, and get to work!
				</p>
			{/if}
		</div>
	</div>
</div>

<dialog
	bind:this={deleteProjectDialog}
	class="w-96 rounded-md p-5 text-zinc-800 shadow-md dark:bg-zinc-700 dark:text-zinc-300 {deleteProjectDialogOpen
		? 'visible'
		: ''}"
	oncancel={(e) => {
		e.preventDefault();
		closeDeleteProjectDialog();
	}}
>
	<h1 class="mb-5 text-lg font-medium tracking-tight">
		Are you sure you want to delete this project?
	</h1>
	<p class="text-sm">You will permanently lose all data related to this project and its tasks.</p>

	<div class="mt-10 flex items-center justify-end gap-2">
		<button
			class="rounded-md bg-zinc-300 p-2 px-4 text-sm text-zinc-950"
			onclick={closeDeleteProjectDialog}>Cancel</button
		>
		<button class="rounded-md bg-red-300 p-2 px-4 text-sm text-red-950" onclick={deleteProject}
			>Delete</button
		>
	</div>
</dialog>

<dialog
	bind:this={taskDialog}
	class="w-full max-w-3xl rounded-md p-5 text-zinc-800 shadow-md dark:bg-zinc-700 dark:text-zinc-50 {taskDialogOpen
		? 'visible'
		: ''}"
	oncancel={(e) => {
		e.preventDefault();
		closeTaskDialog();
	}}
>
	<button
		onclick={(e) => {
			e.preventDefault();
			closeTaskDialog();
		}}
		class="absolute right-0 top-0 -translate-x-1 translate-y-1"
		><X class="size-4 dark:text-zinc-50" /></button
	>
	<h1
		contenteditable="plaintext-only"
		class="cursor-text text-lg font-medium tracking-tight outline-none"
	>
		{tasks.find((task) => task.id === selectedTaskId)?.title}
	</h1>

	<div class="mt-5 flex items-center justify-between">
		<div>
			<button
				class="border-0.5 flex items-center gap-2 rounded-md border-blue-900/50 bg-blue-300 p-1 text-xs font-light text-blue-950 shadow-sm"
				><Play strokeWidth="1.5" class="size-4" /> Start working</button
			>
		</div>
		<div>
			<button
				onclick={deleteTask}
				class="border-0.5 flex items-center gap-2 rounded-md border-red-900/50 bg-red-300 p-1 text-xs font-light text-red-950 shadow-sm"
				><Trash strokeWidth="1.5" class="size-4" /> Delete</button
			>
		</div>
	</div>
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
