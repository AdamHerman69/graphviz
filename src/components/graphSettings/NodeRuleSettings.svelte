<script lang="ts">
	import type { FRule } from '../../utils/rules';
	import { availableAttributes } from '../../utils/graph';
	import type Graph from 'graphology';
	import SettingsColor from './SettingsColor.svelte';
	import type { NodeSettings } from '../../utils/graphSettings';
	import SettingsSlider from './SettingsSlider.svelte';
	import GradientPicker from './GradientPicker.svelte';
	import Rules from './Rules.svelte';
	import NodeLabelSettings from './NodeLabelSettings.svelte';

	export let nodeSettings: NodeSettings;

	console.log('rules: nodesettings:', nodeSettings);

	let leftGetter: (graph: Graph, id: string) => number | string;
	let rightGetter: (graph: Graph, id: string) => number | string;
	let rule: FRule = (graph, id) => {
		return false;
	};

	$: {
		nodeSettings.frule = rule;
	}
</script>

<div>
	<Rules bind:rule type="node" />

	{#if nodeSettings.size}
		<SettingsSlider
			name="size"
			availableAttributes={$availableAttributes.node.range}
			bind:numSettings={nodeSettings.size}
		/>
	{:else}
		<button on:click={() => (nodeSettings['size'] = { name: 'size', value: 1, min: 0, max: 10 })}>
			Modify size
		</button>
	{/if}

	{#if nodeSettings.strokeWidth}
		<SettingsSlider
			name="Stroke"
			availableAttributes={$availableAttributes.node.range}
			bind:numSettings={nodeSettings.strokeWidth}
		/>
	{:else}
		<button
			on:click={() =>
				(nodeSettings['strokeWidth'] = { name: 'strokeWidth', value: 1, min: 0, max: 10 })}
		>
			Modify stroke width
		</button>
	{/if}

	{#if nodeSettings.color}
		<GradientPicker bind:colorSetting={nodeSettings.color} />
	{:else}
		<button on:click={() => (nodeSettings['color'] = { name: 'color', value: 'white' })}>
			Modify color
		</button>
	{/if}

	{#if nodeSettings.strokeColor}
		<SettingsColor bind:colorSetting={nodeSettings.strokeColor} label="stroke color" />
	{:else}
		<button
			on:click={() => (nodeSettings['strokeColor'] = { name: 'strokeColor', value: 'white' })}
		>
			Modify stroke color
		</button>
	{/if}

	{#if nodeSettings.labels}
		<NodeLabelSettings bind:nodeLabels={nodeSettings.labels} />
	{:else}
		<button on:click={() => (nodeSettings['labels'] = [])}> Add labels</button>
	{/if}
</div>
