<script lang="ts">
	import {
		type FRule,
		type GraphPropertyGetter,
		edgePropertyGetters,
		nodePropertyGetters,
		createNodeAttributeGetter,
		createNodePropertyGetter
	} from '../../utils/rules';
	import {
		availableAttributes,
		graphStore,
		type RangeAttribute,
		type StringAttribute
	} from '../../utils/graph';
	import type Graph from 'graphology';
	import SettingsColor from './SettingsColor.svelte';
	import type { EdgeSettings } from '../../utils/graphSettings';
	import SettingsSlider from './SettingsSlider.svelte';
	import GradientPicker from './GradientPicker.svelte';
	import SettingsSelect from './SettingsSelect.svelte';
	import DecoratorSettings from './DecoratorSettings.svelte';

	export let edgeSettings: EdgeSettings;
	let target: 'edge' | 'source' | 'target' = 'edge';
	let operator: string;
	let firstEdge: string;
	let firstNode: string;
	let second: string | number = 2;
	let valueType: 'number' | 'string';

	let leftGetter: (graph: Graph, id: string) => number | string;
	let rightGetter: (graph: Graph, id: string) => number | string;

	let sourceIDGetter = (graph: Graph, id: string) => {
		graph.getSourceAttribute;
	};

	$: first = target === 'edge' ? firstEdge : firstNode;

	$: {
		// todo delete all attribute based rules
		// compute the leftGetter function
		if (first) {
			// graph property for (edge | source | target)
			let propertyGetter: GraphPropertyGetter | undefined;
			if (target === 'edge') propertyGetter = edgePropertyGetters.get(first);
			else if (target === 'source' || target === 'target')
				propertyGetter = createNodePropertyGetter(first, target);
			if (propertyGetter) {
				valueType = propertyGetter.type;
				leftGetter = propertyGetter.function;

				// attribute property for (edge | source | target)
			} else {
				let attribute: RangeAttribute | StringAttribute;
				if (target === 'edge') {
					attribute = [
						...$availableAttributes.edge.range,
						...$availableAttributes.edge.string
					].find((attribute) => attribute.name === first)!;
					leftGetter = attribute!.getter;
				} else if (target === 'source' || target === 'target') {
					attribute = [
						...$availableAttributes.node.range,
						...$availableAttributes.node.string
					].find((attribute) => (attribute.name = first))!;
					// getter needs to get the adjecent node too
					console.log('computing attr getter: ', attribute);
					leftGetter = createNodeAttributeGetter(attribute, target)!.function;
					console.log('getter got: ', leftGetter);
				}
				valueType = attribute!.type;
			}
		}

		rightGetter = () => {
			return second;
		};

		if (first && valueType === 'number') {
			switch (operator) {
				case '=':
					edgeSettings.frule = (graph, id) => {
						return leftGetter(graph, id) === rightGetter(graph, id);
					};
					break;
				case '>':
					edgeSettings.frule = (graph, id) => {
						return leftGetter(graph, id) > rightGetter(graph, id);
					};
					break;
				case '<':
					edgeSettings.frule = (graph, id) => {
						return leftGetter(graph, id) < rightGetter(graph, id);
					};
					break;
				case '>=':
					edgeSettings.frule = (graph, id) => {
						return leftGetter(graph, id) >= rightGetter(graph, id);
					};
					break;
				case '<=':
					edgeSettings.frule = (graph, id) => {
						return leftGetter(graph, id) <= rightGetter(graph, id);
					};
					break;
			}
		} else if (first) {
			edgeSettings.frule = (graph, id) => {
				return leftGetter(graph, id) === rightGetter(graph, id);
			};
		}
	}
</script>

<div class="card p-4 variant-ghost">
	<p>where</p>

	<!-- Select rule target -->
	<select class="select" bind:value={target}>
		<option value="edge">edge</option>
		<option value="source">source</option>
		<option value="target">target</option>
	</select>

	<!-- Left operator settings -->
	{#if target === 'edge'}
		<select class="select" bind:value={first}>
			<optgroup label="edge properties">
				{#each edgePropertyGetters as [name, getter]}
					<option>{name}</option>
				{/each}
			</optgroup>
			<optgroup label="edge attributes">
				{#each $availableAttributes.edge.range as attribute}
					<option>{attribute.name}</option>
				{/each}
				{#each $availableAttributes.edge.string as attribute}
					<option>{attribute.name}</option>
				{/each}
			</optgroup>
		</select>
	{:else}
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
	{/if}

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
