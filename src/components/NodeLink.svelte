<script lang="ts">
	import Graph from 'graphology';
	import type { VizParams } from '../modules/VizParams';
	import { forceSimulation, forceLink, forceManyBody, forceCenter } from 'd3-force';
	import { onMount } from 'svelte';

	export let graph: Graph;
	export let vizParams: VizParams = undefined;
	export let width = 500;
	export let height = 500;

	console.log(graph);
	let d3nodes: { name: string }[] = graph.mapNodes((node: string) => ({ name: node }));
	let d3links: { source: string; target: string }[] = graph.mapEdges(
		(edgeKey: string, edgeAttributes: object, source: string, target: string) => ({
			source: source,
			target: target
		})
	);

	let simulation;

	simulation = forceSimulation(d3nodes)
		.force(
			'link',
			forceLink(d3links).id((d) => d.name)
		)
		.force('charge', forceManyBody())
		.force('center', forceCenter(width / 2, height / 2))
		.on('tick', updateSvg);

	function updateSvg() {
		d3nodes = d3nodes;
		d3links = d3links;
	}

	// onMount(() => {
	// 	simulation = forceSimulation(d3nodes)
	// 		.force(
	// 			'link',
	// 			forceLink(d3links).id((d) => d.name)
	// 		)
	// 		.force('charge', forceManyBody())
	// 		.force('center', (width / 2, height / 2));
	// 	simulation.stop();
	// 	simulation.tick();
	// });
</script>

<svg {width} {height}>
	{#each d3nodes as node}
		<circle class="node" r="5" fill="pink" cx={node.x} cy={node.y}>
			<title>{node.name}</title>
		</circle>
	{/each}

	{#each d3links as link}
		<g stroke="#999" stroke-opacity="0.6">
			<line x1={link.source.x} y1={link.source.y} x2={link.target.x} y2={link.target.y}>
				<title>{link.source.id}</title>
			</line>
		</g>
	{/each}
</svg>

<style>
</style>
