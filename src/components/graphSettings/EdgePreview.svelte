<script lang="ts">
	import type { Renderer } from '../../paperJS/PaperRenderer';
	import { onMount } from 'svelte';
	import { PaperRenderer } from '../../paperJS/PaperRenderer';
	import { axisLeft } from 'd3';
	import type { NodePositionDatum, EdgeDatum } from '../../paperJS/PaperRenderer';
	import type { NodeStyle, EdgeStyle } from '../../stores/newStores';
	import type { EdgeSettings, NodeSettings } from '../../stores/newStores';
	let canvas: HTMLCanvasElement;
	let paperRenderer: Renderer;
	let width: number;
	let height: number;

	export let nodeSettings: NodeSettings;
	export let edgeSettings: EdgeSettings;

	// todo figure out how to do edge previews in different rules for edges and nodes, combined with global

	onMount(() => {
		const nodes: NodePositionDatum[] = [
			{ id: 'left', x: width / 5, y: height / 2 },
			{ id: 'right', x: (width * 4) / 5, y: height / 2 }
		];
		const edges: EdgeDatum[] = [{ id: 'edge', source: 'left', target: 'right' }];

		paperRenderer = new PaperRenderer(canvas, nodes, edges, nodeStyle, edgeStyle);
	});

	// node settings
	$: nodeStyle = {
		size: $graphSettings.nodeSettings[0].size?.value,
		fill: $graphSettings.nodeSettings[0].color?.color,
		strokeColor: $graphSettings.nodeSettings[0].strokeColor?.color,
		strokeThickness: $graphSettings.nodeSettings[0].strokeWidth?.value
	};

	$: {
		paperRenderer?.updateNodeStyle(nodeStyle);
	}

	// edge settings
	$: edgeStyle = {
		type: $graphSettings.edgeSettings[0].type?.value,
		color: $graphSettings.edgeSettings[0].color?.color,
		thickness: $graphSettings.edgeSettings[0].width?.value,
		partialStart: $graphSettings.edgeSettings[0].partialStart?.value,
		partialEnd: $graphSettings.edgeSettings[0].partialEnd?.value
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
