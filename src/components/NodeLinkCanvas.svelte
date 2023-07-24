<script lang="ts">
	import type Graph from 'graphology';
	import { GraphStore } from '../stores/stores';
	import { onMount } from 'svelte';
	import * as Paper from 'paper';
	import * as d3 from 'd3';
	import {
		nodeSize,
		nodeFill,
		nodeStrokeThickness,
		nodeStrokeColor,
		edgeColor,
		edgeThickness
	} from '../stores/stores';

	let canvas: HTMLCanvasElement;

	let width: number;
	let height: number;

	type D3Node = d3.SimulationNodeDatum & {
		name: string;
		circle?: paper.Shape.Circle;
	};

	let d3nodes: D3Node[];
	let d3links: (d3.SimulationLinkDatum<D3Node> & {
		line?: paper.Path.Line;
	})[];
	let simulation: d3.Simulation<D3Node, d3.SimulationLinkDatum<D3Node>>;
	let transform: d3.ZoomTransform = d3.zoomIdentity;

	let mounted = false;

	$: {
		if (mounted) restartSimulation($GraphStore);
	}

	// node settings
	$: {
		if (mounted) {
			let nodeStyle = new Paper.Style({
				fillColor: new Paper.Color(
					`rgba(${$nodeFill.r}, ${$nodeFill.g}, ${$nodeFill.b}, ${$nodeFill.a})`
				),
				strokeColor: new Paper.Color(
					`rgba(${$nodeStrokeColor.r}, ${$nodeStrokeColor.g}, ${$nodeStrokeColor.b}, ${$nodeStrokeColor.a})`
				),
				strokeWidth: $nodeStrokeThickness.value
			});

			d3nodes.forEach((node) => {
				node.circle!.style = nodeStyle;
				node.circle!.radius = $nodeSize.value;
			});
		}
	}

	// edge settings
	$: {
		if (mounted) {
			let edgeStyle = new Paper.Style({
				strokeColor: new Paper.Color(
					`rgba(${$edgeColor.r}, ${$edgeColor.g}, ${$edgeColor.b}, ${$edgeColor.a})`
				),
				strokeWidth: $edgeThickness.value
			});
			d3links.forEach((link) => {
				link.line!.style = edgeStyle;
			});
		}
	}

	function restartSimulation(graph: Graph): void {
		Paper.project.clear();

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
			.on('tick', updatePaper);

		// add paper objects
		const nodeRadius = $nodeSize.value;
		const nodeStrokeWidth = $nodeStrokeThickness.value;
		d3links.forEach((link) => {
			let [sourceAdjusted, targetAdjusted] = adjustLinePointsToNodeSize(
				new Paper.Point(link.source.x, link.source.y),
				new Paper.Point(link.target.x, link.target.y),
				nodeRadius,
				nodeStrokeWidth
			);
			link.line = new Paper.Path.Line({
				from: sourceAdjusted,
				to: targetAdjusted,
				strokeColor: new Paper.Color(
					`rgba(${$edgeColor.r}, ${$edgeColor.g}, ${$edgeColor.b}, ${$edgeColor.a})`
				)
			});
		});
		d3nodes.forEach((node) => {
			node.circle = new Paper.Shape.Circle({
				center: [node.x, node.y],
				radius: $nodeSize.value,
				strokeColor: new Paper.Color(
					`rgba(${$nodeStrokeColor.r}, ${$nodeStrokeColor.g}, ${$nodeStrokeColor.b}, ${$nodeStrokeColor.a})`
				),
				fillColor: new Paper.Color(
					`rgba(${$nodeFill.r}, ${$nodeFill.g}, ${$nodeFill.b}, ${$nodeFill.a})`
				)
			});
		});

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
					.on('zoom', zoomed)
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

	function adjustLinePointsToNodeSize(
		source: paper.Point,
		target: paper.Point,
		nodeRadius: number,
		nodeStrokeWidth: number
	) {
		// Calculate the normalized vector from the source to the target
		let direction = target.subtract(source).normalize();

		// Shorten the source and target points to be just outside the circles
		let newSource = source.add(direction.multiply(nodeRadius + nodeStrokeWidth / 2));
		let newTarget = target.subtract(direction.multiply(nodeRadius + nodeStrokeWidth / 2));

		// Return the shortened points as an array
		return [newSource, newTarget];
	}

	function zoomed(zoomEvent: d3.ZoomBehavior<HTMLCanvasElement, any>) {
		transform = zoomEvent.transform as any;
		const { x, y, k } = transform;

		const canvasCenter = new Paper.Point(Paper.view.bounds.width / 2, Paper.view.bounds.height / 2);
		const newCenter = new Paper.Point(canvasCenter.x - x / k, canvasCenter.y - y / k);
		Paper.view.center = newCenter;
		Paper.view.zoom = k;
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

	function updatePaper() {
		const nodeRadius = $nodeSize.value;
		const nodeStrokeWidth = $nodeStrokeThickness.value;
		d3links.forEach((link) => {
			if (link.line) {
				let [sourceAdjusted, targetAdjusted] = adjustLinePointsToNodeSize(
					link.source.circle.position,
					link.target.circle.position,
					nodeRadius,
					nodeStrokeWidth
				);
				link.line.firstSegment.point = sourceAdjusted;
				link.line.lastSegment.point = targetAdjusted;
			}
		});
		d3nodes.forEach((node) => {
			if (node.circle) {
				node.circle.position = new Paper.Point(node.x!, node.y!);
			}
		});
	}

	onMount(() => {
		mounted = true;
		Paper.setup(canvas);
		restartSimulation($GraphStore);
	});

	async function exportSVG() {
		// TODO add loading screen
		const svgString = Paper.project.exportSVG({ asString: true });
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
