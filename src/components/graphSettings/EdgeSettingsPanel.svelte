<script lang="ts">
	import { nodeSettings, edgeSettings, type EdgeType } from '../../utils/graphSettings';
	import {
		graphStore,
		type RangeAttribute,
		type StringAttribute,
		availableAttributes
	} from '../../utils/graph';

	import SettingsSlider from './SettingsSlider.svelte';
	import SettingsColor from './SettingsColor.svelte';
	import SettingsSelect from './SettingsSelect.svelte';
	import EdgePreview from './EdgePreview.svelte';
	import GradientPicker from './GradientPicker.svelte';
	import DecoratorSettings from './DecoratorSettings.svelte';
	import { Tab, TabGroup } from '@skeletonlabs/skeleton';
	import EdgeRuleSettings from './EdgeRuleSettings.svelte';

	let tabSet: number = 0;

	function newRule() {
		$edgeSettings.push({
			priority: tabSet,
			frule: (graph, id) => false
		});
		tabSet = $edgeSettings.length - 1;
		$edgeSettings = $edgeSettings;
	}

	function deleteRule() {
		$edgeSettings.splice(tabSet, 1);
		$edgeSettings = $edgeSettings;
	}
</script>

<div class="card p-4 variant-ghost">
	<TabGroup>
		{#each $edgeSettings as edgeSettings, index}
			<Tab bind:group={tabSet} value={index} name={index.toString()}>
				{#if index === 0}
					Global
				{:else}
					rule {index}
				{/if}
			</Tab>
		{/each}
		<Tab bind:group={tabSet} name="New" value={$edgeSettings.length}>
			<button on:click={newRule}>New Rule</button>
		</Tab>
	</TabGroup>

	<div class:hidden={tabSet != 0}>
		<!-- <EdgePreview /> -->
		<SettingsSelect name="Edge Type" bind:selectSetting={$edgeSettings[0].type} />
		<SettingsSlider
			name="Thickness"
			availableAttributes={$availableAttributes.edge.range}
			bind:numSettings={$edgeSettings[0].width}
		/>
		<SettingsSlider
			name="Partial edge start"
			availableAttributes={$availableAttributes.edge.range}
			bind:numSettings={$edgeSettings[0].partialStart}
		/>
		<SettingsSlider
			name="Partial edge end"
			availableAttributes={$availableAttributes.edge.range}
			bind:numSettings={$edgeSettings[0].partialEnd}
		/>

		<GradientPicker bind:colorSetting={$edgeSettings[0].color} />
		<DecoratorSettings bind:decoratorSetting={$edgeSettings[0].decorators} />
	</div>

	{#each $edgeSettings as es, index}
		<div class:hidden={tabSet != index}>
			{#if index > 0}
				<button class="button" on:click={deleteRule}>Delete</button>
				<EdgeRuleSettings bind:edgeSettings={es} />
			{/if}
		</div>
	{/each}
</div>
