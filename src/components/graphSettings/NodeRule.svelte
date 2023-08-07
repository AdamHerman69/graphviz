<script lang="ts">
	import type { FRule } from '../../utils/rules';
	import type Graph from 'graphology';
	import { nodePropertyGetters } from '../../utils/rules';
	import { availableAttributes } from '../../utils/graph';
	import type { NodeSettings } from '../../utils/graphSettings';

	export let rule: FRule;
	let operator: string;
	let first: string;
	let second: string | number = 2;
	let valueType: 'number' | 'string';

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
</div>
