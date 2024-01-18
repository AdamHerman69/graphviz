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
		saveState,
		type NumericalSetting,
		type ColorSetting
	} from '../utils/graphSettings';
	import { graphStore, availableAttributes, recomputeGraphAttributes } from '../utils/graph';
	import { getGradientColor } from '../utils/gradient';
	import { onMount } from 'svelte';
	import * as d3 from 'd3';
	import {
		type Renderer,
		type NodePositionDatum,
		type EdgeDatum,
		PaperRenderer
	} from '../paperJS/PaperRenderer';
	import * as dagre from 'dagre';
	import { edgePropertyGetters, nodePropertyGetters } from '../utils/rules';
	import { greadability } from '$lib/greadability';
	import NodeInfo from './NodeInfo.svelte';

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

	let readability: {
		crossing: number;
		crossingAngle: number;
		angularResolutionMin: number;
		angularResolutionDev: number;
	};

	let tickCount = 0;
	let nodeMoved = false;

	let hoveredNodeKey: string | null = null;
	let selectedNode: D3Node | null = null;
	let selectedNodeX: number | undefined = undefined;
	let selectedNodeY: number | undefined = undefined;

	$: {
		if (!selectedNode) {
			selectedNodeX = undefined;
			selectedNodeY = undefined;
		}
		updateSelectedNode(transform); // updates when panning and sim is stopped
	}

	let sticky: boolean = false;

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
		//todo this should be in a separete function
		if (paperRenderer) {
			if ($layout.value == 'force-graph') restartSimulation($graphStore);
			else if ($layout.value == 'tree') treeInit($graphStore); // new graph in tree mode doesn't update
		}
	}

	// node settings
	$: {
		//saveState();
		if (hoveredNodeKey || selectedNode) {
		} // here just to make it reactive

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

		let nodeStyle: NodeStyle = {};

		// todo handle range with properties
		// attribute based styles
		for (let [key, setting] of Object.entries(chosenSettings)) {
			if (setting.attribute) {
				// todo fefactor so we don't have to do this. Maek attribute and property getter be the same thing
				let getter = setting.attribute.getter
					? setting.attribute.getter
					: setting.attribute.function;
				if (setting.min != undefined) {
					setting = setting as NumericalSetting;
					nodeStyle[setting.name] = setting.scale(getter($graphStore, id));
				} else {
					setting = setting as ColorSetting;

					let gradientPosition = setting.scale(getter($graphStore, id));
					nodeStyle[setting.name] = getGradientColor(setting.value, gradientPosition);
				}
			} else {
				nodeStyle[setting.name] = setting.value;
			}
		}

		// labels
		// label attributes
		// node property getters

		nodeStyle.labels = structuredClone(chosenSettings.labels);
		nodeStyle.labels.forEach((label) => {
			if (label.attributeName) {
				if (nodePropertyGetters.has(label.attributeName))
					label.text = nodePropertyGetters
						.get(label.attributeName)!
						.function($graphStore, id)
						.toString();
				else {
					let attributeText = $graphStore.getNodeAttribute(id, label.attributeName);
					label.text = attributeText ? attributeText : '';
				}
			}
		});

		if (hoveredNodeKey === id) {
			nodeStyle.size = nodeStyle.size + 2;
		} else if (selectedNode?.id === id) {
			nodeStyle.strokeWidth = 5;
			nodeStyle.strokeColor = 'rgba(115, 255, 100, 1)';
		}

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

		let edgeStyle: EdgeStyle = {};

		// attribute based styles
		for (let [key, setting] of Object.entries(chosenSettings)) {
			setting = setting as NumericalSetting;
			if (setting.attribute) {
				// todo fefactor so we don't have to do this. Maek attribute and property getter be the same thing
				let getter = setting.attribute.getter
					? setting.attribute.getter
					: setting.attribute.function;
				edgeStyle[setting.name] = setting.scale(getter($graphStore, id));
			} else {
				edgeStyle[setting.name] = setting.value;
			}
		}

		// todo colors

		// labels
		edgeStyle.labels = structuredClone(chosenSettings.labels);
		edgeStyle.labels.forEach((label) => {
			if (label.attributeName) {
				if (edgePropertyGetters.has(label.attributeName)) {
					label.text = edgePropertyGetters
						.get(label.attributeName)!
						.function($graphStore, id)
						.toString();
				} else {
					let attributeText = $graphStore.getEdgeAttribute(id, label.attributeName);
					label.text = attributeText ? attributeText : '';
				}
			}
		});
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
				if (tickCount++ > 100) {
					readability = greadability(d3nodes, d3links);
					tickCount = 0;
				}
				updateSelectedNode();
			})
			.on('end', () => {
				readability = greadability(d3nodes, d3links);
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
		// if (node && node.x && node.y) {
		// 	node.x = transform.applyX(node.x);
		// 	node.y = transform.applyY(node.y);
		// }
		return node;
	}

	function dragStarted(dragEvent: d3.D3DragEvent<SVGCircleElement, any, D3Node>) {
		nodeMoved = false;

		if (!dragEvent.active) simulation.alphaTarget(0.3).restart();
		let draggedNode = dragEvent.subject;

		// draggedNode.fx = transform.invertX(dragEvent.x!);
		// draggedNode.fy = transform.invertY(dragEvent.y!);
	}

	function dragged(dragEvent: d3.D3DragEvent<SVGCircleElement, any, D3Node>) {
		nodeMoved = true;
		let draggedNode = dragEvent.subject;

		let rect = canvas.getBoundingClientRect();
		let x = dragEvent.sourceEvent.clientX - rect.left;
		let y = dragEvent.sourceEvent.clientY - rect.top;

		draggedNode.fx = transform.invertX(x);
		draggedNode.fy = transform.invertY(y);
	}

	function dragEnded(dragEvent: d3.D3DragEvent<SVGCircleElement, any, D3Node>) {
		let draggedNode = dragEvent.subject;
		if (!dragEvent.active) {
			simulation.alphaTarget(0);
			if (!nodeMoved) nodeClicked(draggedNode);
		}

		if (!sticky) {
			draggedNode.fx = null;
			draggedNode.fy = null;
		}
	}

	function nodeClicked(node: D3Node) {
		if (selectedNode?.id === node.id) selectedNode = null;
		else selectedNode = node;
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

	function computeReadability() {
		console.log('computing readability');
		console.log(greadability(d3nodes, d3links));
	}

	function detectHover(event: MouseEvent) {
		let hoveredNode = getD3Node(event);
		hoveredNodeKey = hoveredNode ? hoveredNode.id : null;
	}

	function updateSelectedNode(t: d3.ZoomTransform = transform) {
		if (selectedNode) {
			selectedNodeX = selectedNode.fx ? t.applyX(selectedNode.fx) : t.applyX(selectedNode.x!);
			selectedNodeY = selectedNode.fy ? t.applyY(selectedNode.fy) : t.applyY(selectedNode.y!);
		} else {
			selectedNodeX = undefined;
			selectedNodeY = undefined;
		}
	}
</script>

<div class="relative h-full w-full">
	<canvas
		class="h-full w-full"
		resize
		bind:this={canvas}
		bind:clientWidth={width}
		bind:clientHeight={height}
		on:mousemove={detectHover}
	/>

	<div class="absolute top-20 right-2">
		<button type="button" on:click={exportSVG} class="btn variant-filled">export SVG</button>
		<button type="button" on:click={undo} class="btn variant-filled"> undo</button>
		<button type="button" on:click={redo} class="btn variant-filled"> redo</button>
		<button
			type="button"
			on:click={() => (sticky = !sticky)}
			class="btn {sticky ? 'variant-outline' : 'variant-filled'}">Sticky</button
		>
		<!-- <button type="button" on:click={} class="btn variant-filled">Unstick</button> -->
	</div>

	<div class="card shadow-2xl variant-glass p-4 m-2 rounded-3xl absolute bottom-20 left-80">
		<div>Crossings: {readability?.crossing}</div>
		<div>Crossing Angle: {readability?.crossingAngle}</div>
		<div>Angular ResolutionMin: {readability?.angularResolutionMin}</div>
		<div>Angular Resolution Dev: {readability?.angularResolutionDev}</div>
		<div>NodePosition: {selectedNodeX}, {selectedNodeY}</div>
	</div>

	{#if selectedNode}
		<div class="nodeInfo" style="left: {selectedNodeX}px; top: {selectedNodeY}px;">
			<NodeInfo nodeID={selectedNode.id} />
		</div>
	{/if}
</div>

<style>
	.nodeInfo {
		position: absolute;
		transform: translate(-50%, 20px);
	}
</style>
