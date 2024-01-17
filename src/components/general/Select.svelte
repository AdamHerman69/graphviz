<script lang="ts">
	import { slide } from 'svelte/transition';

	export let options;
	export let selected: string = 'example';

	let isOpen = false;

	function open() {
		isOpen = true;
	}
</script>

<div class="container">
	<div class="header rounded-2xl p-2" on:click={open}>
		{selected}
		<span>v</span>
	</div>
	{#if isOpen}
		<div class="options rounded-3xl">
			<ul>
				<li class="rounded 2xl p-1" transition:slide>Neco</li>
				<li class="rounded 2xl p-1" transition:slide>necoooo</li>
				<li class="rounded 2xl p-1" transition:slide>kokot</li>
			</ul>
		</div>
	{/if}
</div>

<style>
	div.header {
		transition: box-shadow 300ms ease-in-out;
	}
	div.header:hover {
		box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.3);
	}

    div.ooption
</style>
