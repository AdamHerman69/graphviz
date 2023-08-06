<script lang="ts">
	import { nodeSettings, edgeSettings, type EdgeType } from '../../utils/graphSettings';
	import {
		graphStore,
		type RangeAttribute,
		type StringAttribute,
		findAllNodeAttributes,
		findAllEdgeAttributes,
		getAttributeType
	} from '../../utils/graph';

	import SettingsSlider from './SettingsSlider.svelte';
	import SettingsColor from './SettingsColor.svelte';
	import SettingsSelect from './SettingsSelect.svelte';
	import EdgePreview from './EdgePreview.svelte';
	import GradientPicker from './GradientPicker.svelte';
	import DecoratorSettings from './DecoratorSettings.svelte';
	import NodeRuleSettings from './NodeRuleSettings.svelte';
	import { Tab, TabGroup } from '@skeletonlabs/skeleton';
	import { group } from 'd3';

	let availableNodeAttributes: (RangeAttribute | StringAttribute)[];
	let availableEdgeAttributes: (RangeAttribute | StringAttribute)[];

	let tabSet: number = 0;

	$: {
		availableNodeAttributes = findAllNodeAttributes($graphStore).filter(
			(attribute) => getAttributeType(attribute) === 'number'
		);

		availableEdgeAttributes = findAllEdgeAttributes($graphStore).filter(
			(attribute) => getAttributeType(attribute) === 'number'
		);

		console.log('nodeattrs: ', availableNodeAttributes);
		console.log('edgeattrs: ', availableEdgeAttributes);
	}

	function newRule() {
		console.log('new rule!!!');
		$nodeSettings.push({
			priority: tabSet,
			frule: (graph, id) => false,
			color: {
				name: 'color',
				value: [
					['yellow', 0],
					['purple', 1]
				]
			}
		});
		tabSet = $nodeSettings.length - 1;
		$nodeSettings = $nodeSettings;
	}

	function deleteRule() {
		$nodeSettings.splice(tabSet, 1);
		$nodeSettings = $nodeSettings;
	}
</script>

<div class="card h-full p-4 variant-ghost">
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
		<b>Node Settings</b>
		<SettingsSlider
			name="Size"
			availableAttributes={availableNodeAttributes}
			bind:numSettings={$nodeSettings[0].size}
		/>
		<SettingsSlider
			name="Stroke"
			availableAttributes={availableNodeAttributes}
			bind:numSettings={$nodeSettings[0].strokeWidth}
		/>
		<GradientPicker bind:colorSetting={$nodeSettings[0].color} />
		<div class="w-full flex py-1 items-center">
			<SettingsColor bind:colorSetting={$nodeSettings[0].strokeColor} label="" />
			<div>stroke</div>
		</div>

		<b>Edge Settings</b>
		<!-- <EdgePreview /> -->
		<SettingsSelect name="Edge Type" bind:selectSetting={$edgeSettings[0].type} />
		<SettingsSlider
			name="Thickness"
			availableAttributes={availableEdgeAttributes}
			bind:numSettings={$edgeSettings[0].width}
		/>
		<SettingsSlider
			name="Partial edge start"
			availableAttributes={availableEdgeAttributes}
			bind:numSettings={$edgeSettings[0].partialStart}
		/>
		<SettingsSlider
			name="Partial edge end"
			availableAttributes={availableEdgeAttributes}
			bind:numSettings={$edgeSettings[0].partialEnd}
		/>

		<GradientPicker bind:colorSetting={$edgeSettings[0].color} />
		<DecoratorSettings bind:decoratorSetting={$edgeSettings[0].decorators} />
	</div>

	{#each $nodeSettings as ns, index}
		<div class:hidden={tabSet != index}>
			{#if index > 0}
				<button class="button" on:click={deleteRule}>Delete</button>
				<NodeRuleSettings bind:nodeSettings={ns} />
			{/if}
		</div>
	{/each}
</div>
