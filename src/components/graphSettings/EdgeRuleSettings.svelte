<script lang="ts">
	import type { FRule } from '../../utils/rules';
	import {
		availableAttributes,
		graphStore,
		type RangeAttribute,
		type StringAttribute
	} from '../../utils/graph';
	import type { EdgeSettings } from '../../utils/graphSettings';
	import SettingsSlider from './SettingsSlider.svelte';
	import GradientPicker from './GradientPicker.svelte';
	import SettingsSelect from './SettingsSelect.svelte';
	import DecoratorSettings from './DecoratorSettings.svelte';
	import Rules from './Rules.svelte';

	export let edgeSettings: EdgeSettings;
	let rule: FRule = (graph, id) => {
		return false;
	};

	$: {
		edgeSettings.frule = rule;
	}
</script>

<div>
	<Rules bind:rule type="edge" />

	<!-- Edge type -->
	{#if edgeSettings.type}
		<SettingsSelect name="Edge Type" bind:selectSetting={edgeSettings.type} />
	{:else}
		<button
			on:click={() =>
				(edgeSettings['type'] = {
					name: 'type',
					values: ['straight', 'conical', 'arrow'],
					value: 'straight'
				})}
		>
			Modify type
		</button>
	{/if}

	<!-- Edge width -->
	{#if edgeSettings.width}
		<SettingsSlider
			name="Thickness"
			availableAttributes={$availableAttributes.edge.range}
			bind:numSettings={edgeSettings.width}
		/>
	{:else}
		<button
			on:click={() =>
				(edgeSettings['width'] = { name: 'width', value: 1, min: 0, max: 5, increment: 0.5 })}
		>
			Modify width
		</button>
	{/if}

	<!-- Partial start -->
	{#if edgeSettings.partialStart}
		<SettingsSlider
			name="Partial start"
			availableAttributes={$availableAttributes.edge.range}
			bind:numSettings={edgeSettings.partialStart}
		/>
	{:else}
		<button
			on:click={() =>
				(edgeSettings['partialStart'] = {
					name: 'partialStart',
					value: 0,
					min: 0,
					max: 0.5,
					increment: 0.05
				})}
		>
			Modify partial start
		</button>
	{/if}

	<!-- Partial end -->
	{#if edgeSettings.partialEnd}
		<SettingsSlider
			name="Partial end"
			availableAttributes={$availableAttributes.edge.range}
			bind:numSettings={edgeSettings.partialEnd}
		/>
	{:else}
		<button
			on:click={() =>
				(edgeSettings['partialEnd'] = {
					name: 'partialEnd',
					value: 1,
					min: 0.5,
					max: 1,
					increment: 0.05
				})}
		>
			Modify partial end
		</button>
	{/if}

	<!-- Color -->
	{#if edgeSettings.color}
		<GradientPicker bind:colorSetting={edgeSettings.color} />
	{:else}
		<button
			on:click={() =>
				(edgeSettings['color'] = {
					name: 'color',
					value: 'white'
				})}
		>
			Modify color
		</button>
	{/if}

	<!-- Decorators -->
	{#if edgeSettings.decorators}
		<DecoratorSettings bind:decoratorSetting={edgeSettings.decorators} />
	{:else}
		<button
			on:click={() =>
				(edgeSettings['decorators'] = {
					types: ['triangle', 'circle', 'square'],
					name: 'decorators',
					value: []
				})}
		>
			Modify decorators
		</button>
	{/if}
</div>
