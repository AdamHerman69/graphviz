<script lang="ts">
	import type Graph from 'graphology';
	import { GraphStore } from '../stores/stores';
	import * as d3 from 'd3';

	import { onMount } from 'svelte';
	import Node from './Node.svelte';
	import Edge from './Edge.svelte';

	let width: number;
	let height: number;

	let graphSVG: SVGElement;

	type D3Node = d3.SimulationNodeDatum & {
		name: string;
	};

	let d3nodes: D3Node[];
	let d3links: d3.SimulationLinkDatum<D3Node>[];

	$: {
		restartSimulation($GraphStore);
	}

	function restartSimulation(graph: Graph): void {
		// update graph nodes
		d3nodes = graph.mapNodes((node: string) => ({ name: node }));
		d3links = graph.mapEdges(
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
				d3.forceLink(d3links).id((d3node) => (d3node as D3Node).name)
			)
			.force('charge', d3.forceManyBody())
			.force('center', d3.forceCenter(width / 2, height / 2))
			.on('tick', updateSvg);

		// drag and zoom
		d3.select(graphSVG)
			.call(
				d3
					.drag<SVGElement, unknown>()
					.container(graphSVG as d3.DragContainerElement)
					.subject(getD3Node)
					.on('start', dragStarted)
					.on('drag', dragged)
					.on('end', dragEnded)
			)
			.call(
				d3
					.zoom<SVGElement, unknown>()
					.scaleExtent([1 / 10, 8])
					.on('zoom', zoomed)
			);
	}

	onMount(() => restartSimulation($GraphStore));

	let simulation: d3.Simulation<D3Node, d3.SimulationLinkDatum<D3Node>>;
	let transform: d3.ZoomTransform = d3.zoomIdentity;

	function zoomed(zoomEvent: d3.ZoomBehavior<SVGElement, any>) {
		transform = zoomEvent.transform as any;
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
		if (node && node.x && node.y) {
			node.x = transform.applyX(node.x);
			node.y = transform.applyY(node.y);
		}
		return node;
	}

	// if fx/fy is defined on a simulation node, no forces are applied on tick
	// if they're null, forces are applied again
	// alpha - simulation temperature (activeness), converges to currently set alphaTarget, if 0, simulation stops

	function dragStarted(dragEvent: d3.D3DragEvent<SVGCircleElement, any, D3Node>) {
		if (!dragEvent.active) simulation.alphaTarget(0.3).restart();
		let draggedNode = dragEvent.subject;

		draggedNode.fx = transform.invertX(draggedNode.x!);
		draggedNode.fy = transform.invertY(draggedNode.y!);
	}

	function dragged(dragEvent: d3.D3DragEvent<SVGCircleElement, any, D3Node>) {
		let draggedNode = dragEvent.subject;
		draggedNode.fx = transform.invertX(dragEvent.x);
		draggedNode.fy = transform.invertY(dragEvent.y);
	}

	function dragEnded(dragEvent: d3.D3DragEvent<SVGCircleElement, any, D3Node>) {
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
		<!--these ts errors can't be handled, no TS in markup-->
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
