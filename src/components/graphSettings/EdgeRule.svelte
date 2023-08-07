<script lang="ts">
	import {
		type FRule,
		type GraphPropertyGetter,
		edgePropertyGetters,
		nodePropertyGetters,
		createNodeAttributeGetter,
		createNodePropertyGetter
	} from '../../utils/rules';
	import type Graph from 'graphology';
	import {
		availableAttributes,
		type RangeAttribute,
		type StringAttribute
	} from '../../utils/graph';

	export let rule: FRule;
	let target: 'edge' | 'source' | 'target' = 'edge';
	let operator: string;
	let firstEdge: string;
	let firstNode: string;
	let second: string | number = 2;
	let valueType: 'number' | 'string';

	let leftGetter: (graph: Graph, id: string) => number | string;
	let rightGetter: (graph: Graph, id: string) => number | string;

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
					rule = (graph, id) => {
						return leftGetter(graph, id) === rightGetter(graph, id);
					};
					break;
				case '>':
					rule = (graph, id) => {
						return leftGetter(graph, id) > rightGetter(graph, id);
					};
					break;
				case '<':
					rule = (graph, id) => {
						return leftGetter(graph, id) < rightGetter(graph, id);
					};
					break;
				case '>=':
					rule = (graph, id) => {
						return leftGetter(graph, id) >= rightGetter(graph, id);
					};
					break;
				case '<=':
					rule = (graph, id) => {
						return leftGetter(graph, id) <= rightGetter(graph, id);
					};
					break;
			}
		} else if (first) {
			rule = (graph, id) => {
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
</div>
