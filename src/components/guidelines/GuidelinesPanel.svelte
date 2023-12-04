<script lang="ts">
	import { guidelines } from '../../guidelines/guideline';
	import GuidelineCard from './GuidelineCard.svelte';
</script>

<div class="card p-4 variant-ghost">
	<div>Guidelines</div>
	{#each $guidelines as guideline}
		<GuidelineCard {guideline} />
	{/each}
</div>
