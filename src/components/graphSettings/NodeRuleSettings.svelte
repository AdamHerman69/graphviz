<script lang="ts">
	import { type FRule, type graphPropertyGetter, nodePropertyGetters } from '../../utils/rules';
	import {
		availableAttributes,
		graphStore,
		type RangeAttribute,
		type StringAttribute
	} from '../../utils/graph';
	import type Graph from 'graphology';
	import SettingsColor from './SettingsColor.svelte';
	import type { NodeSettings } from '../../utils/graphSettings';
	import SettingsSlider from './SettingsSlider.svelte';
	import GradientPicker from './GradientPicker.svelte';

	export let nodeSettings: NodeSettings;
	let operator: string;
	let first: string;
	let second: string | number = 2;
	let valueType: 'number' | 'string';

	console.log('rules: nodesettings:', nodeSettings);

	let leftGetter: (graph: Graph, id: string) => number | string;
	let rightGetter: (graph: Graph, id: string) => number | string;

	$: {
		// todo delete all attribute based rules

		if (first && nodePropertyGetters.get(first)) {
			valueType = nodePropertyGetters.get(first)!.type;
			leftGetter = nodePropertyGetters.get(first)!.function;
		} else if (first) {
			let attribute = [
				...$availableAttributes.node.range,
				...$availableAttributes.node.string
			].find((attribute) => attribute.name === first);
			valueType = attribute!.type;
			leftGetter = attribute!.getter;
		}

		rightGetter = () => {
			return second;
		};

		if (first && valueType === 'number') {
			switch (operator) {
				case '=':
					nodeSettings.frule = (graph, id) => {
						return leftGetter(graph, id) === rightGetter(graph, id);
					};
					break;
				case '>':
					nodeSettings.frule = (graph, id) => {
						return leftGetter(graph, id) > rightGetter(graph, id);
					};
					break;
				case '<':
					nodeSettings.frule = (graph, id) => {
						return leftGetter(graph, id) < rightGetter(graph, id);
					};
					break;
				case '>=':
					nodeSettings.frule = (graph, id) => {
						return leftGetter(graph, id) >= rightGetter(graph, id);
					};
					break;
				case '<=':
					nodeSettings.frule = (graph, id) => {
						return leftGetter(graph, id) <= rightGetter(graph, id);
					};
					break;
			}
		} else if (first) {
			nodeSettings.frule = (graph, id) => {
				return leftGetter(graph, id) === rightGetter(graph, id);
			};
		}
	}
</script>

<div class="card p-4 variant-ghost">
	<p>where</p>

	<select class="select" bind:value={first}>
		<optgroup label="graph properties">
			{#each nodePropertyGetters as [name, getter]}
				<option>{name}</option>
			{/each}
		</optgroup>
		<optgroup label="node attributes">
			{#each $availableAttributes.node.range as attribute}
				<option>{attribute.name}</option>
			{/each}
			{#each $availableAttributes.node.string as attribute}
				<option>{attribute.name}</option>
			{/each}
		</optgroup>
	</select>

	<!-- Numerical Operator -->
	{#if valueType === 'number'}
		<select class="select" bind:value={operator}>
			<option value="=">=</option>
			<option value=">">&gt</option>
			<option value="<">&lt</option>
			<option value=">=">≥</option>
			<option value="<=">≤</option>
		</select>

		<input type="number" class="bg-transparent" bind:value={second} />
	{:else}
		<div class="flex">
			<p>is</p>
			<input type="string" class="bg-transparent mx-1 w-full" bind:value={second} />
		</div>
	{/if}

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
</div>
