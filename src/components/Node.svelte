<script lang="ts">
	import { nodeSize, nodeFill, nodeStrokeThickness, nodeStrokeColor } from '../stores/stores';
	import type { ZoomTransform } from 'd3';

	export let x: number;
	export let y: number;
	export let transform: ZoomTransform;
</script>

<circle
	class="node"
	r={$nodeSize.value}
	fill="rgb({$nodeFill.r}, {$nodeFill.g}, {$nodeFill.b}"
	fill-opacity={$nodeFill.a}
	stroke="rgb({$nodeStrokeColor.r}, {$nodeStrokeColor.g}, {$nodeStrokeColor.b}"
	stroke-opacity={$nodeStrokeColor.a}
	stroke-width={$nodeStrokeThickness.value}
	cx={x}
	cy={y}
	transform="translate({transform.x} {transform.y}) scale({transform.k} {transform.k})"
/>
