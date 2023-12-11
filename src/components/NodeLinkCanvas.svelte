<script lang="ts">
	import type Graph from 'graphology';
	import {
		nodeSettings,
		edgeSettings,
		layout,
		undo,
		redo,
		history,
		type NodeSettings,
		type EdgeSettings,
		type NodeStyle,
		type EdgeStyle,
		type Setting,
		type NodeProperties,
		type EdgeProperties,
		cloneNodeSettings,
		cloneEdgeSettings,
		saveState
	} from '../utils/graphSettings';
	import { graphStore, availableAttributes, recomputeGraphAttributes } from '../utils/graph';

	import { onMount } from 'svelte';
	import * as d3 from 'd3';
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
	let nodeStyles: Map<string, NodeStyle> = new Map<string, NodeStyle>();
	let edgeStyles: Map<string, EdgeStyle> = new Map<string, EdgeStyle>();

	onMount(() => {
		paperRenderer = new PaperRenderer(canvas, [], [], nodeStyles, edgeStyles);
		recomputeGraphAttributes($graphStore, $availableAttributes);
		restartSimulation($graphStore);
		saveState();
	});

	$: {
		updateStyleMapsOnGraphChange($graphStore);
		recomputeGraphAttributes($graphStore, $availableAttributes);

		console.log('graph change node styles: ', nodeStyles);
		// todo this should be in a separete function
		// if (paperRenderer) {
		// 	if ($layout.value == 'force-graph') restartSimulation($graphStore);
		// 	else if ($layout.value == 'tree') treeInit($graphStore); // new graph in tree mode doesn't update
		// }
	}

	// node settings
	$: {
		//saveState();

		//console.log('updating nodes settings', $nodeSettings);
		for (const [key, style] of nodeStyles.entries()) {
			nodeStyles.set(key, getNodeStyle(key, $nodeSettings));
		}
		paperRenderer?.updateNodeStyles(nodeStyles);
	}

	// edge settings
	$: {
		//saveState();

		//console.log('updating edge settings', $edgeSettings);
		for (const [key, style] of edgeStyles.entries()) {
			edgeStyles.set(key, getEdgeStyle(key, $edgeSettings));
		}
		paperRenderer?.updateEdgeStyles(edgeStyles);
	}

	function stripAttributeBasedSettings() {
		$nodeSettings.forEach((nodeSetting) => {
			delete nodeSetting.color?.attribute;
			delete nodeSetting.size?.attribute;
			delete nodeSetting.strokeColor?.attribute;
			delete nodeSetting.strokeWidth?.attribute;
		});

		$edgeSettings.forEach((edgeSetting) => {
			delete edgeSetting.color?.attribute;
			delete edgeSetting.partialEnd?.attribute;
			delete edgeSetting.partialStart?.attribute;
			delete edgeSetting.type?.attribute;
			delete edgeSetting.width?.attribute;
		});
	}

	function updateStyleMapsOnGraphChange(graph: Graph) {
		stripAttributeBasedSettings();

		nodeStyles = new Map<string, NodeStyle>();
		graph.forEachNode((id) => nodeStyles.set(id, getNodeStyle(id, $nodeSettings)));

		edgeStyles = new Map<string, EdgeStyle>();
		graph.forEachEdge((id) => edgeStyles.set(id, getEdgeStyle(id, $edgeSettings)));
	}

	function getNodeStyle(id: string, nodeSettings: NodeSettings[]): NodeStyle {
		let chosenSettings: NodeProperties = {};

		// iterating in increasing priority order
		nodeSettings.forEach((nodeSettings) => {
			if (nodeSettings.frule($graphStore, id)) {
				if (nodeSettings.size) chosenSettings['size'] = nodeSettings.size;
				if (nodeSettings.color) chosenSettings['color'] = nodeSettings.color;
				if (nodeSettings.strokeWidth) chosenSettings['strokeWidth'] = nodeSettings.strokeWidth;
				if (nodeSettings.strokeColor) chosenSettings['strokeColor'] = nodeSettings.strokeColor;
				if (nodeSettings.labels) chosenSettings['labels'] = nodeSettings.labels;
			}
		});

		// todo label text

		let nodeStyle: NodeStyle = {};

		// attribute based styles
		for (const [key, setting] of Object.entries(chosenSettings)) {
			if (setting.attribute) {
				let attributeValue = $graphStore.getNodeAttribute(id, setting.attribute.name);
				nodeStyle[setting.name] = setting.attribute.scale(attributeValue);
			} else {
				nodeStyle[setting.name] = setting.value;
			}
		}

		nodeStyle.labels = chosenSettings.labels;
		return nodeStyle;
	}

	function getEdgeStyle(id: string, edgeSettings: EdgeSettings[]): EdgeStyle {
		let chosenSettings: EdgeProperties = {};

		// iterating in increasing priority order
		edgeSettings.forEach((edgeSettings) => {
			if (edgeSettings.frule($graphStore, id)) {
				if (edgeSettings.type) chosenSettings['type'] = edgeSettings.type;
				if (edgeSettings.width) chosenSettings['width'] = edgeSettings.width;
				if (edgeSettings.color) chosenSettings['color'] = edgeSettings.color;
				if (edgeSettings.partialStart) chosenSettings['partialStart'] = edgeSettings.partialStart;
				if (edgeSettings.partialEnd) chosenSettings['partialEnd'] = edgeSettings.partialEnd;
				if (edgeSettings.decorators) chosenSettings['decorators'] = edgeSettings.decorators;
				if (edgeSettings.labels) chosenSettings['labels'] = edgeSettings.labels;
			}
		});

		// todo label text

		let edgeStyle: EdgeStyle = {};

		// attribute based styles
		for (const [key, setting] of Object.entries(chosenSettings)) {
			if (setting.attribute) {
				let attributeValue = $graphStore.getEdgeAttribute(id, setting.attribute.name);
				edgeStyle[setting.name] = setting.attribute.scale(attributeValue);
				console.log('got special value: ', edgeStyle[setting.name]);
			} else {
				edgeStyle[setting.name] = setting.value;
			}
		}
		edgeStyle.labels = chosenSettings.labels;
		return edgeStyle;
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

		const size = $nodeSettings[0].size!.value;
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
			value: {
				width: $nodeSettings[0].size?.value,
				height: $nodeSettings[0].size?.value
			} // todo get actual width
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
		paperRenderer.restart(
			d3nodes as NodePositionDatum[],
			d3links as EdgeDatum[],
			nodeStyles,
			edgeStyles
		);

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
<button type="button" on:click={undo} class="btn variant-filled absolute top-10 left-5">
	undo</button
>
<button type="button" on:click={redo} class="btn variant-filled absolute top-30 left-5">
	redo</button
>
<canvas
	class="h-full w-full border-solid border-2 border-orange-200"
	resize
	bind:this={canvas}
	bind:clientWidth={width}
	bind:clientHeight={height}
/>
