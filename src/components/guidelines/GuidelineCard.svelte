<script lang="ts">
	import type { Guideline } from '../../guidelines/guideline';
	import { apply } from '../../guidelines/guideline';

	export let guideline: Guideline;
</script>

<div class="card shadow-2xl variant-glass p-4 m-2 rounded-3xl">
	<div>{guideline.name}</div>
	<div>{guideline.description}</div>
	<div>score: {guideline.score}</div>
	<div>lit: {guideline.literature}</div>
	<button class="btn btn-sm variant-ghost" on:click={() => apply(guideline)}>apply</button>
</div>
