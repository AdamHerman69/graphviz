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
	import EdgeLabelSettings from './EdgeLabelSettings.svelte';
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
		tabSet--;
		$edgeSettings = $edgeSettings;
	}
</script>

<div class="card p-4 m-2 rounded-3xl">
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
			name="Partial edge"
			availableAttributes={$availableAttributes.edge.range}
			bind:numSettings={$edgeSettings[0].partialStart}
			bind:secondNumSettings={$edgeSettings[0].partialEnd}
		/>

		<GradientPicker bind:colorSetting={$edgeSettings[0].color} />
		<DecoratorSettings bind:decoratorSetting={$edgeSettings[0].decorators} />
		<EdgeLabelSettings bind:edgeLabels={$edgeSettings[0].labels} />
	</div>

	{#each $edgeSettings as es, index}
		<div class:hidden={tabSet != index}>
			{#if index > 0}
				<button
					class="h-6 w-6 rounded-full border-dashed border-2 border-white absolute"
					on:click={deleteRule}>x</button
				>
				<EdgeRuleSettings bind:edgeSettings={es} />
			{/if}
		</div>
	{/each}
</div>
