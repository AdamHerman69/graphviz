<script lang="ts">
	import { guidelines } from '../../guidelines/guideline';
	import GuidelineCard from './GuidelineCard.svelte';
</script>

<div>
	{#each $guidelines as guideline}
		<GuidelineCard {guideline} />
	{/each}
</div>
