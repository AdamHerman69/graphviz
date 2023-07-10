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

	let svg;

	let d3nodes: { name: string }[] = graph.mapNodes((node: string) => ({ name: node }));
	let d3links: { source: string; target: string }[] = graph.mapEdges(
		(edgeKey: string, edgeAttributes: object, source: string, target: string) => ({
			source: source,
			target: target
		})
	);
	console.log(d3nodes);

	let simulation;
	let transform = d3.zoomIdentity;

	simulation = d3
		.forceSimulation(d3nodes)
		.force(
			'link',
			d3.forceLink(d3links).id((d) => d.name)
		)
		.force('charge', d3.forceManyBody())
		.force('center', d3.forceCenter(width / 2, height / 2))
		.on('tick', updateSvg);

	onMount(() => {
		d3.select(svg)
			.call(
				d3
					.drag()
					.container(svg)
					.subject(dragSubject)
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

	const clickRadius = 5;
	function dragSubject(currentEvent) {
		console.log('dragSubject, ', currentEvent);
		const node = simulation.find(
			transform.invertX(currentEvent.x),
			transform.invertY(currentEvent.y),
			clickRadius
		);
		if (node) {
			node.x = transform.applyX(node.x);
			node.y = transform.applyY(node.y);
		}
		console.log('returning: ', node);
		return node;
	}

	function dragStarted(currentEvent) {
		console.log('dragstart');
		if (!currentEvent.active) simulation.alphaTarget(0.3).restart();
		currentEvent.subject.fx = transform.invertX(currentEvent.subject.x);
		currentEvent.subject.fy = transform.invertY(currentEvent.subject.y);
	}

	function dragged(currentEvent) {
		console.log('dragged');
		currentEvent.subject.fx = transform.invertX(currentEvent.x);
		currentEvent.subject.fy = transform.invertY(currentEvent.y);
	}

	function dragEnded(currentEvent) {
		console.log('dragend');
		if (!currentEvent.active) simulation.alphaTarget(0);
		currentEvent.subject.fx = null;
		currentEvent.subject.fy = null;
	}

	// function getDraggedNode(dragEvent: Event) {
	// 	console.log(event);
	// 	return d3nodes.find((node) => node.name === dragEvent.target.getAttribute('id'));
	// }
</script>

<svg bind:this={svg} {width} {height}>
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
