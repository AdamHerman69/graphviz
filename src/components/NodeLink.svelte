<script lang="ts">
	import Graph from 'graphology';
	import { GraphStore } from '../stores/stores';
	import { forceSimulation, forceLink, forceManyBody, forceCenter } from 'd3-force';
	// import { SimulationNodeDatum, SimulationLinkDatum } from '@types/d3-force';
	// Failed to resolve entry for package "@types/d3-force", not sure why
	// TODO look into it later maybe
	import { drag } from 'd3-drag';
	import { select } from 'd3-selection';
	import { zoom, zoomIdentity } from 'd3-zoom';
	import { onMount } from 'svelte';
	import type { Writable } from 'svelte/store';
	import Node from './Node.svelte';
	import Edge from './Edge.svelte';

	const d3 = {
		forceSimulation,
		forceLink,
		forceManyBody,
		forceCenter,
		drag,
		select,
		zoom,
		zoomIdentity
	};

	let width: number;
	let height: number;

	let graphSVG: SVGElement;

	// TODO refactor these objects into arguments of graphology, so the state is all in one place
	// No, shouldn't be in graphology state - this is component specific for force-graph, clickable events should still work
	let d3nodes: { name: string };
	let d3links: { source: string; target: string }[];

	$: {
		restartSimulation($GraphStore);
	}

	function restartSimulation(graphStore: Writable<Graph>): void {
		// update graph nodes
		d3nodes = $GraphStore.mapNodes((node: string) => ({ name: node }));
		d3links = $GraphStore.mapEdges(
			(edgeKey: string, edgeAttributes: object, source: string, target: string) => ({
				source: source,
				target: target
			})
		);

		// start d3-force
		simulation = d3
			.forceSimulation(d3nodes)
			.force(
				'link',
				d3.forceLink(d3links).id((d) => d.name)
			)
			.force('charge', d3.forceManyBody())
			.force('center', d3.forceCenter(width / 2, height / 2))
			.on('tick', updateSvg);

		// drag and zoom
		d3.select(graphSVG)
			.call(
				d3
					.drag()
					.container(graphSVG)
					.subject(getD3Node)
					.on('start', dragStarted)
					.on('drag', dragged)
					.on('end', dragEnded)
			)
			.call(
				d3
					.zoom()
					.scaleExtent([1 / 10, 8])
					.on('zoom', zoomed)
			);
	}

	onMount(() => restartSimulation($GraphStore));

	let simulation;
	let transform: Transform = d3.zoomIdentity;

	function zoomed(zoomEvent: ZoomEvent) {
		transform = zoomEvent.transform;
		updateSvg();
	}

	function updateSvg() {
		// for svelte to re-render
		d3nodes = d3nodes;
		d3links = d3links;
	}

	const clickRadius = 5; // TODO refactor elsewhere, change on mobile
	function getD3Node(mouseEvent: MouseEvent) {
		const node = simulation.find(
			transform.invertX(mouseEvent.x),
			transform.invertY(mouseEvent.y),
			clickRadius
		);
		if (node) {
			node.x = transform.applyX(node.x);
			node.y = transform.applyY(node.y);
		}
		return node;
	}

	// if fx/fy is defined on a simulation node, no forces are applied on tick
	// if they're null, forces are applied again
	// alpha - simulation temperature (activeness), converges to currently set alphaTarget, if 0, simulation stops

	function dragStarted(dragEvent: DragEvent) {
		if (!dragEvent.active) simulation.alphaTarget(0.3).restart();
		let draggedNode = dragEvent.subject;

		draggedNode.fx = transform.invertX(draggedNode.x);
		draggedNode.fy = transform.invertY(draggedNode.y);
	}

	function dragged(dragEvent: DragEvent) {
		let draggedNode = dragEvent.subject;
		draggedNode.fx = transform.invertX(dragEvent.x);
		draggedNode.fy = transform.invertY(dragEvent.y);
	}

	function dragEnded(dragEvent: DragEvent) {
		if (!dragEvent.active) simulation.alphaTarget(0);
		let draggedNode = dragEvent.subject;
		draggedNode.fx = null;
		draggedNode.fy = null;
	}

	// TODO refactor highlight into graphology state
	// function onNodeMouseEnter(mouseEvent: MouseEvent) {
	// 	const nodeCircle: SVGCircleElement = mouseEvent.target;
	// 	nodeCircle.setAttribute('stroke', 'purple');
	// }

	// function onNodeMouseOut(mouseEvent: MouseEvent) {
	// 	let nodeCircle: SVGCircleElement = mouseEvent.target;
	// 	nodeCircle.removeAttribute('stroke');
	// }
</script>

<div class="h-full" bind:clientWidth={width} bind:clientHeight={height}>
	<svg bind:this={graphSVG} {width} {height}>
		{#each d3links as link}
			<Edge
				sourceX={link.source.x}
				sourceY={link.source.y}
				targetX={link.target.x}
				targetY={link.target.y}
				{transform}
			/>
		{/each}

		{#each d3nodes as node}
			<Node x={node.x} y={node.y} {transform} />
		{/each}
	</svg>
</div>

<style>
</style>
