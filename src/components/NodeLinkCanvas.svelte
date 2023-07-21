<script lang="ts">
	import type Graph from 'graphology';
	import { GraphStore } from '../stores/stores';
	import { onMount } from 'svelte';

	let graphDiv: HTMLDivElement;

	let width: number;
	let height: number;

	function graphologyToForceGraph(graphologyGraph: Graph): GraphData {
		return {
			nodes: graphologyGraph.mapNodes((key: string, attributes: object) => ({
				id: key,
				...attributes
			})),
			links: graphologyGraph.mapEdges(
				(key: string, attributes: object, source: string, target: string) => ({
					source: source,
					target: target,
					...attributes
				})
			)
		};
	}

	onMount(async () => {
		const ForceGraph = (await import('force-graph')).default;
		const forceGraph = ForceGraph()(graphDiv)
			.width(width)
			.height(height)
			.graphData(graphologyToForceGraph($GraphStore));
		console.log(width);
	});
</script>

<div class="h-full" bind:this={graphDiv} bind:clientWidth={width} bind:clientHeight={height} />
