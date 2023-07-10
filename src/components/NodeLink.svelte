<script lang="ts">
	import Graph from 'graphology';
	import type { VizParams } from '../modules/VizParams';
	import { forceSimulation, forceLink, forceManyBody, forceCenter } from 'd3-force';
	import { drag } from 'd3-drag';
	import { select } from 'd3-selection';
	import { zoom, zoomIdentity } from 'd3-zoom';
	import { onMount } from 'svelte';

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

	export let graph: Graph;
	export let vizParams: VizParams = undefined;
	export let width = 500;
	export let height = 500;

	let graphSVG: SVGElement;
	let d3nodes: { name: string }[] = graph.mapNodes((node: string) => ({ name: node }));
	let d3links: { source: string; target: string }[] = graph.mapEdges(
		(edgeKey: string, edgeAttributes: object, source: string, target: string) => ({
			source: source,
			target: target
		})
	);

	let simulation;
	let transform = d3.zoomIdentity;

	onMount(() => {
		// start simulation
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
					.subject(getDragD3Node)
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
	});

	function zoomed(currentEvent) {
		transform = currentEvent.transform;
		updateSvg();
	}

	function updateSvg() {
		// for svelte to re-render
		d3nodes = d3nodes;
		d3links = d3links;
	}

	const clickRadius = 5; // TODO refactor elsewhere, change on mobile
	function getDragD3Node(currentEvent) {
		const node = simulation.find(
			transform.invertX(currentEvent.x),
			transform.invertY(currentEvent.y),
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

	function dragStarted(currentEvent) {
		if (!currentEvent.active) simulation.alphaTarget(0.3).restart();
		let draggedNode = currentEvent.subject;

		draggedNode.fx = transform.invertX(draggedNode.x);
		draggedNode.fy = transform.invertY(draggedNode.y);
	}

	function dragged(currentEvent) {
		let draggedNode = currentEvent.subject;
		draggedNode.fx = transform.invertX(currentEvent.x);
		draggedNode.fy = transform.invertY(currentEvent.y);
	}

	function dragEnded(currentEvent) {
		if (!currentEvent.active) simulation.alphaTarget(0);
		let draggedNode = currentEvent.subject;
		draggedNode.fx = null;
		draggedNode.fy = null;
	}
</script>

<svg bind:this={graphSVG} {width} {height}>
	{#each d3links as link}
		<g stroke="#999" stroke-opacity="0.6">
			<line
				x1={link.source.x}
				y1={link.source.y}
				x2={link.target.x}
				y2={link.target.y}
				transform="translate({transform.x} {transform.y}) scale({transform.k} {transform.k})"
			>
				<title>{link.source.id}</title>
			</line>
		</g>
	{/each}

	{#each d3nodes as node}
		<circle
			id={node.name}
			class="node"
			r="5"
			fill="pink"
			cx={node.x}
			cy={node.y}
			transform="translate({transform.x} {transform.y}) scale({transform.k} {transform.k})"
		>
			<title>{node.name}</title>
		</circle>
	{/each}
</svg>

<style>
</style>
