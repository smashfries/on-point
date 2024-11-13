<script lang="ts">
    import type { PageData, ActionData } from './$types';

    let {data, form}: {data: PageData, form: ActionData} = $props();
</script>

<div class="text-center mt-10">
    <a href="/" class="tracking-tighter italic text-zinc-400 font-medium">on point</a>
</div>
<form method="POST" class="w-96 mx-auto mt-3 rounded-md shadow-lg dark:bg-zinc-700 dark:text-zinc-50 p-5">
    <h1 class="text-2xl font-medium tracking-tight">Sign up</h1>

    <div class="mt-5 flex flex-col gap-2">
        <input type="text" name="name" required value={form?.name ?? ''} class="w-full h-10 border-zinc-200 dark:border-transparent outline-none dark:bg-zinc-100 rounded-md text-zinc-700 focus:ring-2 focus:ring-zinc-300 focus:border-zinc-400 transition-all duration-200 text-sm" placeholder="Name">
        <input type="email" name="email" required value={form?.email ?? ''} class="w-full h-10 border-zinc-200 dark:border-transparent outline-none dark:bg-zinc-100 rounded-md text-zinc-700 focus:ring-2 focus:ring-zinc-300 focus:border-zinc-400 transition-all duration-200 text-sm" placeholder="Email">
        <input type="password" name="password" required minlength="8" class="w-full h-10 border-zinc-200 border-transparent outline-none dark:bg-zinc-100 rounded-md text-zinc-700 focus:ring-2 focus:ring-zinc-300 focus:border-zinc-400 transition-all duration-200 text-sm" placeholder="Password">
    </div>
    <div class="mt-5">
        <input type="submit" value="Sign up" class="w-full text-blue-50 bg-blue-500 h-10 text-sm rounded-md active:ring-2 active:ring-blue-300 transition-all duration-200">
    </div>

    <div class="text-center mt-10 text-xs dark:text-zinc-300 text-zinc-600">
        Already have an account? <a href="/login" class="underline dark:text-zinc-200 text-zinc-800">Log in</a>
    </div>
</form>

{#if form?.error}
<div class="w-96 p-5 py-3 text-sm mx-auto rounded-md border border-red-900/10 bg-red-500/10 dark:text-red-100 text-red-800 mt-5">
    {form.errorMessage}
</div>
{/if}