<script lang="ts">
	import EdgeRuleSettings from './EdgeRuleSettings.svelte';
	import EdgeSettingsGlobal from './EdgeSettingsGlobal.svelte';
	import { edgeSettings } from '../../utils/graphSettings';

	function newRule() {
		$edgeSettings.push({
			priority: $edgeSettings.length + 1,
			frule: (graph, id) => false,
			source: null
		});
		$edgeSettings = $edgeSettings;
	}

	function deleteRule() {
		console.log('delete rule');
		// $nodeSettings.splice(tabSet, 1);
		// $nodeSettings = $nodeSettings;
	}
</script>

<div class="card shadow-2xl variant-glass p-8 m-2 rounded-3xl">
	<EdgeSettingsGlobal />
</div>

{#each $edgeSettings as es, index}
	{#if index > 0}
		<div class="card shadow-2xl variant-glass p-8 m-2 rounded-3xl">
			<EdgeRuleSettings bind:edgeSettings={es} />
		</div>
	{/if}
{/each}
<div>
	<button class="btn btn-sm variant-ghost" on:click={newRule}>New Rule</button>
</div>
