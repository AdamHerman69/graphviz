<script lang="ts">
	import type { Renderer } from '../../paperJS/PaperRenderer';
	import { onMount } from 'svelte';
	import { PaperRenderer } from '../../paperJS/PaperRenderer';
	import { axisLeft } from 'd3';
	import type { NodePositionDatum, EdgeDatum } from '../../paperJS/PaperRenderer';
	import {
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
		edgeType
	} from '../../stores/stores';

	let canvas: HTMLCanvasElement;
	let paperRenderer: Renderer;
	let width: number;
	let height: number;
	let nodeStyle: NodeStyle;
	let edgeStyle: EdgeStyle;

	onMount(() => {
		const nodes: NodePositionDatum[] = [
			{ id: 'left', x: width / 5, y: height / 2 },
			{ id: 'right', x: (width * 4) / 5, y: height / 2 }
		];
		const edges: EdgeDatum[] = [{ id: 'edge', source: 'left', target: 'right' }];

		// todo figure out two canvases
		paperRenderer = new PaperRenderer(canvas, nodes, edges, nodeStyle, edgeStyle);
	});

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
</script>

<div>
	<canvas
		class="h-16 w-full border-solid border-2 border-orange-200"
		bind:this={canvas}
		bind:clientWidth={width}
		bind:clientHeight={height}
	/>
</div>
