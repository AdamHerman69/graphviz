<script lang="ts">
	import type Graph from 'graphology';
	import {
		GraphStore,
		type NodeStyle,
		type EdgeStyle,
		partialEdgeStart,
		partialEdgeEnd,
		nodeSize,
		nodeFill,
		nodeStrokeThickness,
		nodeStrokeColor,
		edgeColor,
		edgeThickness,
		edgeType,
		layout
	} from '../stores/stores';
	import { onMount } from 'svelte';
	import * as d3 from 'd3';
	import {} from '../stores/stores';
	import {
		type Renderer,
		type NodePositionDatum,
		type EdgeDatum,
		PaperRenderer
	} from '../paperJS/PaperRenderer';
	import * as dagre from 'dagre';

	let canvas: HTMLCanvasElement;

	let width: number;
	let height: number;

	type D3Node = d3.SimulationNodeDatum & {
		id: string;
	};

	let d3nodes: D3Node[];
	let d3links: (d3.SimulationLinkDatum<D3Node> & { id: string })[];
	let simulation: d3.Simulation<D3Node, d3.SimulationLinkDatum<D3Node>>;
	let simRunning: boolean = false; // the sim initializes with a bunch of tick events dispatched, so we check for this in the tick event, if we switched the layout
	let paperRenderer: Renderer;
	let transform: d3.ZoomTransform = d3.zoomIdentity;
	let nodeStyle: NodeStyle;
	let edgeStyle: EdgeStyle;

	onMount(() => {
		paperRenderer = new PaperRenderer(canvas, [], [], nodeStyle, edgeStyle);
		restartSimulation($GraphStore);
	});

	$: {
		if (paperRenderer) {
			if ($layout.selected == 'force-graph') restartSimulation($GraphStore);
			else if ($layout.selected == 'tree') treeInit($GraphStore);
		}
	}

	// node settings
	$: nodeStyle = {
		size: $nodeSize.value,
		fill: `rgba(${$nodeFill.r}, ${$nodeFill.g}, ${$nodeFill.b}, ${$nodeFill.a})`,
		strokeColor: `rgba(${$nodeStrokeColor.r}, ${$nodeStrokeColor.g}, ${$nodeStrokeColor.b}, ${$nodeStrokeColor.a})`,
		strokeThickness: $nodeStrokeThickness.value
	};

	$: {
		paperRenderer?.updateNodeStyle(nodeStyle);
	}

	// edge settings
	$: edgeStyle = {
		type: $edgeType.selected,
		color: `rgba(${$edgeColor.r}, ${$edgeColor.g}, ${$edgeColor.b}, ${$edgeColor.a})`,
		thickness: $edgeThickness.value,
		partialStart: $partialEdgeStart.value,
		partialEnd: $partialEdgeEnd.value
	};

	$: {
		paperRenderer?.updateEdgeStyle(edgeStyle);
	}

	function treeInit(graph: Graph) {
		simulation.stop();
		simRunning = false;
		console.log('sim stopped');
		let g = buildDagreGraph(graph);
		dagre.layout(g);
		console.log(g.graph());

		const sclaleWidth = d3.scaleLinear().domain([0, g.graph().width!]).range([0, width]);
		const scaleHeight = d3.scaleLinear().domain([0, g.graph().height!]).range([0, height]);

		let newPositions: NodePositionDatum[] = [];

		g.nodes().forEach((id) => {
			newPositions.push({
				id: id,
				x: sclaleWidth(g.node(id).x),
				y: scaleHeight(g.node(id).y)
			});
		});

		paperRenderer.updatePositions(newPositions);
	}

	function buildDagreGraph(graph: Graph): dagre.graphlib.Graph {
		let g = new dagre.graphlib.Graph();
		g.setGraph({});
		g.setDefaultEdgeLabel(function () {
			return {};
		});

		const size = $nodeSize.value;
		graph.forEachNode((node) => {
			g.setNode(node, { label: node, width: size, height: size });
		});

		graph.forEachEdge((edgeKey, attr, source, target) => {
			g.setEdge(source, target);
		});
		return g;
	}

	function restartSimulation(graph: Graph): void {
		simRunning = true;
		// update graph nodes
		d3nodes = graph.mapNodes((node: string) => ({
			id: node,
			v: node,
			value: { width: $nodeSize.value, height: $nodeSize.value }
		}));
		d3links = graph.mapEdges(
			(edgeKey: string, edgeAttributes: object, source: string, target: string) => ({
				id: edgeKey,
				source: source,
				target: target,
				v: source,
				w: target
			})
		);

		// add paper objects - has to be before the simulation inicialization because that changes the d3links objects
		paperRenderer.restart(d3nodes as NodePositionDatum[], d3links as EdgeDatum[]);

		// start d3-force
		simulation = d3
			.forceSimulation(d3nodes)
			.force(
				'link',
				d3.forceLink(d3links).id((d3node) => (d3node as D3Node).id)
			)
			.force('charge', d3.forceManyBody())
			.force('center', d3.forceCenter(width / 2, height / 2))
			.on('tick', () => {
				if (simRunning) paperRenderer.updatePositions(d3nodes as NodePositionDatum[]);
			});

		// styles should persist

		// drag and zoom
		d3.select(canvas)
			.call(
				d3
					.drag<HTMLCanvasElement, unknown>()
					.container(canvas as d3.DragContainerElement)
					.subject(getD3Node)
					.on('start', dragStarted)
					.on('drag', dragged)
					.on('end', dragEnded)
			)
			.call(
				d3
					.zoom<HTMLCanvasElement, unknown>()
					.scaleExtent([1 / 10, 8])
					.on('zoom', (zoomEvent) => {
						transform = paperRenderer.zoomed(zoomEvent);
					})
			);
	}

	const clickRadius = 10; // TODO refactor elsewhere, change on mobile
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

	async function exportSVG() {
		// TODO add loading screen
		const svgString = paperRenderer.exportSVG();
		downloadSvgFile(svgString as string, 'graph.svg');
	}

	function downloadSvgFile(svgString: string, fileName: string) {
		const svgBlob = new Blob([svgString], { type: 'image/svg+xml' });

		// Create an anchor element to initiate the download
		const anchorElement = document.createElement('a');
		anchorElement.href = URL.createObjectURL(svgBlob);
		anchorElement.download = fileName;

		// Append the anchor element to the document and simulate a click event
		document.body.appendChild(anchorElement);
		anchorElement.click();

		// Remove the anchor element from the document
		document.body.removeChild(anchorElement);

		// Revoke the object URL to free up resources
		URL.revokeObjectURL(anchorElement.href);
	}
</script>

<button type="button" on:click={exportSVG} class="btn variant-filled absolute top-5"
	>export SVG</button
>
<canvas
	class="h-full w-full border-solid border-2 border-orange-200"
	resize
	bind:this={canvas}
	bind:clientWidth={width}
	bind:clientHeight={height}
/>
