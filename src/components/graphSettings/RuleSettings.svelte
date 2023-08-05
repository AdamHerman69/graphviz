<script lang="ts">
	import type { FRule } from '../../utils/rules';
	import type Graph from 'graphology';
	import SettingsColor from './SettingsColor.svelte';
	import type { NodeSettings } from '../../utils/graphSettings';

	export let nodeSettings: NodeSettings;
	let type: 'NODE' | 'EDGE';
	let operator: string;
	let inputNumber = 2;
	let first: 'in' | 'out';

	$: {
		let firstF: (graph: Graph, id: string) => number;
		let secondF: (graph: Graph, id: string) => number;
		firstF =
			first === 'in' ? (graph, id) => graph.inDegree(id) : (graph, id) => graph.outDegree(id);
		secondF = () => {
			return inputNumber;
		};

		switch (operator) {
			case '=':
				nodeSettings.frule = (graph, id) => {
					return firstF(graph, id) === secondF(graph, id);
				};
				break;
			case '>':
				nodeSettings.frule = (graph, id) => {
					return firstF(graph, id) > secondF(graph, id);
				};
				break;
			case '<':
				nodeSettings.frule = (graph, id) => {
					return firstF(graph, id) < secondF(graph, id);
				};
				break;
			case '>=':
				nodeSettings.frule = (graph, id) => {
					return firstF(graph, id) >= secondF(graph, id);
				};
				break;
			case '<=':
				nodeSettings.frule = (graph, id) => {
					return firstF(graph, id) <= secondF(graph, id);
				};
				break;
		}
	}
</script>

<div class="card p-4 variant-ghost">
	<select class="select" bind:value={type}>
		<option value="NODE">node</option>
		<option value="EDGE">edge</option>
	</select>

	<p>where</p>

	<select class="select" bind:value={first}>
		<option value="in">in degree</option>
		<option value="out">out degree</option>
	</select>

	<!-- Operator -->
	<select class="select" bind:value={operator}>
		<option value="=">=</option>
		<option value=">">&gt</option>
		<option value="<">&lt</option>
		<option value=">=">&ge</option>
		<option value="<=">&le</option>
	</select>

	<input type="number" class="bg-transparent" bind:value={inputNumber} />

	<SettingsColor label="clr" bind:colorSetting={nodeSettings.color} />
</div>
