<script lang="ts">
	import { guidelines } from '../../guidelines/guideline';
	import GuidelineCard from './GuidelineCard.svelte';
</script>

<div class="card p-4 m-2 rounded-3xl">
	<div>Guidelines</div>
	{#each $guidelines as guideline}
		<GuidelineCard {guideline} />
	{/each}
</div>
