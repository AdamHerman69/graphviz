<script lang="ts">
	import {
		history,
		currentStateIndex,
		nodeSettings,
		edgeSettings,
		type EdgeType
	} from '../../utils/graphSettings';
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
	import NodeRuleSettings from './NodeRuleSettings.svelte';
	import { Tab, TabGroup } from '@skeletonlabs/skeleton';

	let tabSet: number = 0;

	function newRule() {
		$nodeSettings.push({
			priority: tabSet,
			frule: (graph, id) => false
		});
		tabSet = $nodeSettings.length - 1;
		$nodeSettings = $nodeSettings;
	}

	function deleteRule() {
		$nodeSettings.splice(tabSet, 1);
		tabSet--;
		$nodeSettings = $nodeSettings;
	}
</script>

<div class="card p-4 variant-ghost">
	<TabGroup>
		{#each $nodeSettings as nodeSettings, index}
			<Tab bind:group={tabSet} value={index} name={index.toString()}>
				{#if index === 0}
					Global
				{:else}
					rule {index}
				{/if}
			</Tab>
		{/each}
		<Tab bind:group={tabSet} name="New" value={$nodeSettings.length}>
			<button on:click={newRule}>New Rule</button>
		</Tab>
	</TabGroup>

	<div class:hidden={tabSet != 0}>
		<SettingsSlider
			name="Size"
			availableAttributes={$availableAttributes.node.range}
			bind:numSettings={$nodeSettings[0].size}
		/>
		<SettingsSlider
			name="Stroke"
			availableAttributes={$availableAttributes.node.range}
			bind:numSettings={$nodeSettings[0].strokeWidth}
		/>
		<GradientPicker bind:colorSetting={$nodeSettings[0].color} />
		<div class="w-full flex py-1 items-center">
			<SettingsColor bind:colorSetting={$nodeSettings[0].strokeColor} label="" />
			<div>stroke</div>
		</div>
	</div>
	{#each $nodeSettings as ns, index}
		<div class:hidden={tabSet != index}>
			{#if index > 0}
				<button
					class="h-6 w-6 rounded-full border-dashed border-2 border-white absolute"
					on:click={deleteRule}>x</button
				>
				<NodeRuleSettings bind:nodeSettings={ns} />
			{/if}
		</div>
	{/each}
</div>
