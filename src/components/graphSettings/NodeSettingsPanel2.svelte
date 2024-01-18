<script lang="ts">
	import NodeSettingsGlobal from './NodeSettingsGlobal.svelte';
	import { nodeSettings } from '../../utils/graphSettings';
	import NodeRuleSettings from './NodeRuleSettings.svelte';
	import RangeSlider from '$lib/myRangeSlider/RangeSlider.svelte';
	import { onMount } from 'svelte';
	import Select from '../general/Select.svelte';

	function newRule() {
		$nodeSettings.push({
			priority: $nodeSettings.length + 1,
			frule: (graph, id) => false,
			source: null
		});
		$nodeSettings = $nodeSettings;
	}

	function deleteRule() {
		console.log('delete rule');
		// $nodeSettings.splice(tabSet, 1);
		// $nodeSettings = $nodeSettings;
	}

	// Animations
	// let globalSettingsDiv: HTMLDivElement;
	// let resizeObserver: ResizeObserver;
	// let height = 'auto';

	// onMount(() => {
	// 	setTimeout(() => {
	// 		resizeObserver = new ResizeObserver((entries) => {
	// 			globalSettingsDiv.style.transition = 'height 0.5s';
	// 			height = `${entries[0].contentRect.height}px`;
	// 		});
	// 		resizeObserver.observe(globalSettingsDiv);
	// 	}, 100);
	// });

	// todo on destroy observer disconnect
</script>

<div class="card shadow-2xl variant-glass p-4 m-2 rounded-3xl">
	<NodeSettingsGlobal />
</div>

{#each $nodeSettings as ns, index}
	{#if index > 0}
		<div class="card shadow-2xl variant-glass p-4 m-2 rounded-3xl">
			<NodeRuleSettings bind:nodeSettings={ns} />
		</div>
	{/if}
{/each}
<div>
	<button class="btn btn-sm variant-filled" on:click={newRule}>New Rule</button>
</div>
