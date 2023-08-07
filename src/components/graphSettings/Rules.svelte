<script lang="ts">
	import type Graph from 'graphology';
	import type { FRule } from '../../utils/rules';
	import EdgeRule from './EdgeRule.svelte';
	import NodeRule from './NodeRule.svelte';

	export let rule: FRule;
	export let type: 'node' | 'edge';

	let ruleObjects: { rule: FRule; type: 'atomic' | 'nested' }[] = [
		{
			rule: (graph, id) => {
				return false;
			},
			type: 'atomic'
		}
	];
	let operator: 'AND' | 'OR' = 'AND';

	function addAtomicRule() {
		ruleObjects.push({
			rule: (graph, id) => {
				false;
			},
			type: 'atomic'
		});
		ruleObjects = ruleObjects;
	}

	function addNestedRule() {
		ruleObjects.push({
			rule: (graph, id) => {
				false;
			},
			type: 'nested'
		});
		ruleObjects = ruleObjects;
	}

	function switchOperator() {
		if (operator === 'AND') operator = 'OR';
		else operator = 'AND';
	}

	$: rules = ruleObjects.map((ruleObject) => ruleObject.rule);

	$: {
		// create the acumulator function
		if (operator === 'AND')
			rule = (graph: Graph, id: string) => {
				return rules.reduce((result, rule) => result && rule(graph, id), rules[0](graph, id));
			};
		else if (operator === 'OR') {
			rule = (graph: Graph, id: string) => {
				return rules.reduce((result, rule) => result || rule(graph, id), rules[0](graph, id));
			};
		}
	}
</script>

<div class="card variant-ghost p-1">
	{#each ruleObjects as subRule, index}
		{#if subRule.type === 'atomic'}
			{#if type === 'edge'}
				<EdgeRule bind:rule={subRule.rule} />
			{:else}
				<NodeRule bind:rule={subRule.rule} />
			{/if}
		{:else}
			<svelte:self bind:rule={subRule.rule} {type} />
		{/if}
		{#if ruleObjects.length > 1 && index < ruleObjects.length - 1}
			<div class="flex align-middle">
				<p class="align-middle">{operator}</p>
				<button class="btn btn-sm variant-ghost" on:click={switchOperator}>switch</button>
			</div>
		{/if}
	{/each}

	<div class="flex">
		<button class="btn btn-sm variant-ghost" on:click={addAtomicRule}>add atomic</button>
		<button class="btn btn-sm variant-ghost" on:click={addNestedRule}>add nested</button>
	</div>
</div>
