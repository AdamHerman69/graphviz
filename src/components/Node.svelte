<script lang="ts">
	import {
		nodeSize,
		nodeFill,
		nodeOpacity,
		nodeStrokeThickness,
		nodeStrokeColor
	} from '../stores/stores';

	import type { ZoomTransform } from 'd3';

	export let x: number;
	export let y: number;
	export let transform: ZoomTransform;
</script>

<circle
	class="node"
	r={$nodeSize.value}
	fill={$nodeFill}
	opacity={$nodeOpacity.value}
	stroke={$nodeStrokeColor}
	stroke-width={$nodeStrokeThickness.value}
	cx={x}
	cy={y}
	transform="translate({transform.x} {transform.y}) scale({transform.k} {transform.k})"
/>
